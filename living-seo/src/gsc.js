import crypto from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data', 'gsc');
const tokenFile = path.join(dataDir, 'oauth-token.json');
const metadataFile = path.join(dataDir, 'metadata.json');
const pendingStates = new Set();

const oauthScope = 'https://www.googleapis.com/auth/webmasters.readonly';

export function getGscConfig(env = process.env) {
  const redirectUri = env.LIVING_SEO_GSC_REDIRECT_URI || 'http://localhost:3017/api/gsc/connect/callback';

  return {
    clientId: env.LIVING_SEO_GSC_CLIENT_ID || '',
    clientSecret: env.LIVING_SEO_GSC_CLIENT_SECRET || '',
    siteUrl: env.LIVING_SEO_GSC_SITE_URL || '',
    redirectUri,
  };
}

export function getGscStatus(env = process.env) {
  const config = getGscConfig(env);

  return readStoredToken().then((token) => readMetadata().then((metadata) => ({
    configured: Boolean(config.clientId && config.clientSecret && config.siteUrl),
    connected: Boolean(token?.refresh_token || token?.access_token),
    property: config.siteUrl || null,
    redirectUri: config.redirectUri,
    lastSyncAt: metadata.lastSyncAt || null,
  })));
}

export function createAuthUrl(env = process.env) {
  const config = getGscConfig(env);
  assertConfigured(config);

  const state = crypto.randomBytes(24).toString('hex');
  pendingStates.add(state);

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', oauthScope);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', state);

  return url.toString();
}

export async function exchangeCodeForTokens(code, state, env = process.env) {
  const config = getGscConfig(env);
  assertConfigured(config);

  if (!state || !pendingStates.has(state)) {
    throw new Error('Invalid or expired Google OAuth state.');
  }

  pendingStates.delete(state);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || 'Failed to exchange Google OAuth code.');
  }

  const existing = await readStoredToken();
  const token = {
    ...existing,
    ...payload,
    receivedAt: new Date().toISOString(),
  };
  await writeStoredToken(token);
  return token;
}

export async function fetchGscCloseWins(projectConfig, options = {}) {
  const config = getGscConfig(options.env || process.env);
  assertConfigured(config);

  const accessToken = await getValidAccessToken(options.env || process.env);
  const primaryLocation = inferPrimaryLocation(projectConfig);
  const focusTerms = buildFocusTerms(projectConfig, primaryLocation);
  const startDate = getIsoDate(options.days ?? 90);
  const endDate = getIsoDate(1);

  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      type: 'web',
      rowLimit: 2500,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Failed to query Search Console.');
  }

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const matchedRows = rows
    .map((row) => normalizeGscRow(row))
    .filter((row) => row.query && row.page)
    .filter((row) => matchesFocusTerms(row, focusTerms))
    .filter((row) => row.impressions >= 2)
    .filter((row) => row.position > 0 && row.position <= 50)
    .sort((left, right) => left.position - right.position || right.impressions - left.impressions)
    .slice(0, options.limit ?? 150);

  const result = {
    property: config.siteUrl,
    projectSlug: projectConfig.slug,
    primaryLocation,
    focusTerms,
    fetchedAt: new Date().toISOString(),
    dateRange: {
      startDate,
      endDate,
    },
    rows: matchedRows,
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, `${projectConfig.slug}-close-wins.json`), JSON.stringify(result, null, 2));
  await writeMetadata({
    lastSyncAt: result.fetchedAt,
  });

  return result;
}

export async function readStoredCloseWins(projectSlug) {
  try {
    const raw = await readFile(path.join(dataDir, `${projectSlug}-close-wins.json`), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getValidAccessToken(env = process.env) {
  const token = await readStoredToken();
  if (!token) {
    throw new Error('Google Search Console is not connected yet.');
  }

  if (token.access_token && !isExpired(token)) {
    return token.access_token;
  }

  if (!token.refresh_token) {
    throw new Error('Google Search Console refresh token is missing. Reconnect GSC.');
  }

  const config = getGscConfig(env);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || 'Failed to refresh Google OAuth token.');
  }

  const nextToken = {
    ...token,
    ...payload,
    receivedAt: new Date().toISOString(),
  };
  await writeStoredToken(nextToken);
  return nextToken.access_token;
}

function normalizeGscRow(row) {
  const keys = Array.isArray(row.keys) ? row.keys : [];
  return {
    query: String(keys[0] || '').trim(),
    page: String(keys[1] || '').trim(),
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    ctr: Number(row.ctr || 0),
    position: Number(row.position || 0),
  };
}

function buildFocusTerms(projectConfig, primaryLocation) {
  const terms = new Set();
  const locationParts = String(primaryLocation || '')
    .toLowerCase()
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of locationParts) {
    if (part.length > 2) {
      terms.add(part);
    }
  }

  for (const keyword of projectConfig.keywords || []) {
    for (const token of String(keyword.keyword || '').toLowerCase().split(/\s+/)) {
      if (token.length > 4) {
        terms.add(token);
      }
    }
  }

  return [...terms].slice(0, 20);
}

function matchesFocusTerms(row, focusTerms) {
  const haystack = `${row.query} ${row.page}`.toLowerCase();
  return focusTerms.some((term) => haystack.includes(term));
}

function inferPrimaryLocation(projectConfig) {
  const counts = new Map();
  for (const keyword of projectConfig.keywords || []) {
    const location = String(keyword.location || '').trim();
    if (!location) {
      continue;
    }

    counts.set(location, (counts.get(location) || 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || null;
}

function getIsoDate(daysAgo) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function isExpired(token) {
  const receivedAt = Date.parse(token.receivedAt || '');
  const expiresIn = Number(token.expires_in || 0);
  if (!receivedAt || !expiresIn) {
    return true;
  }

  return Date.now() >= receivedAt + Math.max(expiresIn - 60, 0) * 1000;
}

function assertConfigured(config) {
  if (!config.clientId || !config.clientSecret || !config.siteUrl) {
    throw new Error('Set LIVING_SEO_GSC_CLIENT_ID, LIVING_SEO_GSC_CLIENT_SECRET, and LIVING_SEO_GSC_SITE_URL before connecting GSC.');
  }
}

async function readStoredToken() {
  try {
    const raw = await readFile(tokenFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeStoredToken(token) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(tokenFile, JSON.stringify(token, null, 2));
}

async function readMetadata() {
  try {
    const raw = await readFile(metadataFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeMetadata(metadata) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
}
