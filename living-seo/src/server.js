import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeProject } from './core.js';
import { analyzeLatestRuns, collectProject, getDemoConfig, monitorProject } from './collector.js';
import { DEMO_PROJECT } from './demo-data.js';
import { loadEnvFile } from './env.js';
import { createAuthUrl, exchangeCodeForTokens, fetchGscCloseWins, getGscStatus, readStoredCloseWins } from './gsc.js';
import { listProjectNames, loadProjectConfig } from './project-loader.js';
import { listRuns, readRun } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
const port = Number(process.env.PORT || 3017);

loadEnvFile();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(response, 200, { ok: true, service: 'living-seo', port });
    }

    if (request.method === 'GET' && url.pathname === '/api/gsc/status') {
      return sendJson(response, 200, { ok: true, ...(await getGscStatus(process.env)) });
    }

    if (request.method === 'GET' && url.pathname === '/api/gsc/connect/start') {
      response.writeHead(302, { location: createAuthUrl(process.env) });
      response.end();
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/gsc/connect/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      if (!code) {
        return sendHtml(response, 400, '<h1>Google Search Console connection failed</h1><p>Missing authorization code.</p>');
      }

      await exchangeCodeForTokens(code, state, process.env);
      return sendHtml(
        response,
        200,
        '<h1>Google Search Console connected</h1><p>You can close this tab and return to Living SEO.</p>',
      );
    }

    if (request.method === 'POST' && url.pathname === '/api/gsc/sync') {
      const projectName = url.searchParams.get('project');
      if (!projectName) {
        return sendJson(response, 400, { ok: false, error: 'project query param is required' });
      }

      const projectConfig = await loadProjectConfig(projectName);
      const result = await fetchGscCloseWins(projectConfig, { env: process.env });
      return sendJson(response, 200, { ok: true, ...result });
    }

    if (request.method === 'GET' && url.pathname === '/api/projects') {
      const projects = await listProjectNames();
      const summaries = await Promise.all(projects.map((projectName) => buildProjectSummary(projectName)));
      return sendJson(response, 200, { ok: true, projects: summaries });
    }

    const projectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/dashboard$/);
    if (request.method === 'GET' && projectMatch) {
      const projectName = decodeURIComponent(projectMatch[1]);
      return sendJson(response, 200, await buildProjectDashboard(projectName));
    }

    if (request.method === 'GET' && url.pathname === '/api/demo-run') {
      return sendJson(response, 200, analyzeProject(DEMO_PROJECT));
    }

    if (request.method === 'GET' && url.pathname === '/api/demo-project') {
      return sendJson(response, 200, DEMO_PROJECT);
    }

    if (request.method === 'POST' && url.pathname === '/api/demo-collect') {
      const scenario = url.searchParams.get('scenario') || 'current';
      const collected = await collectProject(getDemoConfig(), {
        provider: { name: 'fixture', scenario },
      });
      return sendJson(response, 200, {
        ok: true,
        scenario,
        slug: collected.slug,
        filePath: collected.filePath,
        collectedAt: collected.run.collectedAt,
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/demo-runs') {
      return sendJson(response, 200, {
        ok: true,
        slug: getDemoConfig().slug,
        runs: await listRuns(getDemoConfig().slug),
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/demo-latest-analysis') {
      return sendJson(response, 200, await analyzeLatestRuns(getDemoConfig()));
    }

    if (request.method === 'POST' && url.pathname === '/api/project-monitor') {
      const projectName = url.searchParams.get('project');
      if (!projectName) {
        return sendJson(response, 400, { ok: false, error: 'project query param is required' });
      }
      const projectConfig = await loadProjectConfig(projectName);
      const result = await monitorProject(projectConfig, {
        provider: { name: 'serper' },
        notifyTelegram: true,
        env: process.env,
      });
      return sendJson(response, 200, {
        ok: true,
        slug: result.collected.slug,
        collectedAt: result.collected.run.collectedAt,
        provider: result.collected.run.provider,
        outrankEventCount: result.analysis.summary.outrankEventCount,
        telegramSent: result.telegram.sent,
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/analyze') {
      const payload = await readJson(request);
      return sendJson(response, 200, analyzeProject(payload));
    }

    if (request.method === 'GET' && url.pathname === '/') {
      return sendFile(response, path.join(publicDir, 'index.html'), 'text/html; charset=utf-8');
    }

    if (request.method === 'GET' && url.pathname === '/app.js') {
      return sendFile(response, path.join(publicDir, 'app.js'), 'text/javascript; charset=utf-8');
    }

    response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: false, error: 'Not found' }));
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected server error',
    });
  }
});

server.listen(port, () => {
  console.log(`Living SEO MVP running at http://localhost:${port}`);
});

async function sendFile(response, filePath, contentType) {
  const body = await readFile(filePath, 'utf8');
  response.writeHead(200, { 'content-type': contentType });
  response.end(body);
}

function sendHtml(response, statusCode, body) {
  response.writeHead(statusCode, { 'content-type': 'text/html; charset=utf-8' });
  response.end(body);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
  });
  response.end(JSON.stringify(payload, null, 2));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

async function buildProjectSummary(projectName) {
  const projectConfig = await loadProjectConfig(projectName);
  const runs = await listRuns(projectConfig.slug);
  const latestRun = runs.length ? await readRun(projectConfig.slug, runs[runs.length - 1]) : null;
  const latestAnalysis = await tryAnalyzeLatestRuns(projectConfig);
  const keywordPerformance = buildKeywordPerformance(
    latestRun,
    projectConfig.business?.domain,
    projectConfig.watchedCompetitors || [],
  );

  return {
    slug: projectConfig.slug,
    projectName: projectConfig.projectName,
    businessDomain: normalizeDomain(projectConfig.business?.domain),
    keywordCount: projectConfig.keywords?.length || 0,
    watchedCompetitorCount: projectConfig.watchedCompetitors?.length || 0,
    runCount: runs.length,
    lastCollectedAt: latestRun?.collectedAt || null,
    lastProvider: latestRun?.provider || null,
    top3Count: keywordPerformance.summary.top3Count,
    top10Count: keywordPerformance.summary.top10Count,
    outrankEventCount: latestAnalysis?.summary?.outrankEventCount || 0,
    autopilotReadyCount: latestAnalysis?.summary?.autopilotReadyCount || 0,
    status: deriveProjectStatus(latestRun, latestAnalysis),
  };
}

async function buildProjectDashboard(projectName) {
  const projectConfig = await loadProjectConfig(projectName);
  const runFiles = await listRuns(projectConfig.slug);
  const latestRun = runFiles.length ? await readRun(projectConfig.slug, runFiles[runFiles.length - 1]) : null;
  const analysis = await tryAnalyzeLatestRuns(projectConfig);
  const keywordPerformance = buildKeywordPerformance(
    latestRun,
    projectConfig.business?.domain,
    projectConfig.watchedCompetitors || [],
  );
  const gscCloseWins = await readStoredCloseWins(projectConfig.slug);
  const gscStatus = await getGscStatus(process.env);
  const outrankPlan = buildOutrankPlan(projectConfig, keywordPerformance, analysis);
  const primaryLocation = inferPrimaryLocation(projectConfig);
  const closeWinKeywords = buildCloseWinKeywords(keywordPerformance.rows, primaryLocation);
  const effectiveCloseWins = buildEffectiveCloseWins(closeWinKeywords, gscCloseWins);
  const localOpportunityKeywords = buildLocalOpportunityKeywords(gscCloseWins, primaryLocation);
  const pageCluster = buildPageCluster(projectConfig, keywordPerformance.rows, primaryLocation);

  return {
    ok: true,
    project: {
      slug: projectConfig.slug,
      projectName: projectConfig.projectName,
      business: projectConfig.business,
      watchedCompetitors: projectConfig.watchedCompetitors || [],
      snapshotRules: projectConfig.snapshotRules || {},
      keywordCount: projectConfig.keywords?.length || 0,
      trackedLocations: unique((projectConfig.keywords || []).map((item) => item.location).filter(Boolean)),
      primaryLocation,
      runCount: runFiles.length,
      lastCollectedAt: latestRun?.collectedAt || null,
      lastProvider: latestRun?.provider || null,
      status: deriveProjectStatus(latestRun, analysis),
    },
    integrations: getIntegrationStatus(process.env, gscStatus),
    latestRun: latestRun
      ? {
          collectedAt: latestRun.collectedAt,
          provider: latestRun.provider,
          keywordCount: latestRun.keywords?.length || 0,
          snapshotCount: Object.keys(latestRun.pageSnapshots || {}).length,
        }
      : null,
    runHistory: runFiles.slice(-10).reverse().map((fileName) => ({
      fileName,
      collectedAt: parseRunFileName(fileName),
    })),
    keywordPerformance,
    pageCluster,
    closeWinKeywords: effectiveCloseWins,
    localOpportunityKeywords,
    gscCloseWins,
    outrankPlan,
    latestAnalysis: analysis
      ? {
          available: true,
          ...analysis,
        }
      : {
          available: false,
          error: 'At least two stored runs are required before analysis',
        },
  };
}

async function tryAnalyzeLatestRuns(projectConfig) {
  try {
    return await analyzeLatestRuns(projectConfig);
  } catch {
    return null;
  }
}

function buildKeywordPerformance(run, businessDomain, watchedCompetitors = []) {
  if (!run) {
    return {
      summary: {
        top1Count: 0,
        top3Count: 0,
        top10Count: 0,
        unrankedCount: 0,
      },
      rows: [],
    };
  }

  const normalizedBusinessDomain = normalizeDomain(businessDomain);
  const watchedCompetitorMap = new Map(
    watchedCompetitors
      .map((entry) => {
        const domain = normalizeDomain(entry?.domain || entry);
        return [domain, entry?.name || domain];
      })
      .filter(([domain]) => domain),
  );
  const rows = (run.keywords || []).map((keywordEntry) => {
    const results = Array.isArray(keywordEntry.results) ? keywordEntry.results : [];
    const yourMentions = results.filter((result) => normalizeDomain(result.domain || result.url) === normalizedBusinessDomain);
    const yourBest = yourMentions.sort((left, right) => Number(left.position || 999) - Number(right.position || 999))[0] || null;
    const topSerpOccupant = results.find((result) => normalizeDomain(result.domain || result.url) !== normalizedBusinessDomain) || null;
    const topWatchedCompetitor = results.find((result) => watchedCompetitorMap.has(normalizeDomain(result.domain || result.url))) || null;
    const yourBestPosition = yourBest ? Number(yourBest.position || 0) : null;
    const topSerpOccupantDomain = topSerpOccupant ? normalizeDomain(topSerpOccupant.domain || topSerpOccupant.url) : null;
    const topWatchedCompetitorDomain = topWatchedCompetitor ? normalizeDomain(topWatchedCompetitor.domain || topWatchedCompetitor.url) : null;

    return {
      keyword: keywordEntry.keyword,
      location: keywordEntry.location,
      device: keywordEntry.device || 'desktop',
      yourBestPosition,
      yourUrl: yourBest?.url || null,
      topSerpOccupantDomain,
      topSerpOccupantPosition: topSerpOccupant ? Number(topSerpOccupant.position || 0) : null,
      topSerpOccupantTitle: topSerpOccupant?.title || null,
      topWatchedCompetitorDomain,
      topWatchedCompetitorName: topWatchedCompetitorDomain
        ? watchedCompetitorMap.get(topWatchedCompetitorDomain) || topWatchedCompetitorDomain
        : null,
      topWatchedCompetitorPosition: topWatchedCompetitor ? Number(topWatchedCompetitor.position || 0) : null,
      status: getKeywordStatus(yourBestPosition),
    };
  });

  return {
    summary: {
      top1Count: rows.filter((row) => row.yourBestPosition === 1).length,
      top3Count: rows.filter((row) => row.yourBestPosition && row.yourBestPosition <= 3).length,
      top10Count: rows.filter((row) => row.yourBestPosition && row.yourBestPosition <= 10).length,
      unrankedCount: rows.filter((row) => !row.yourBestPosition).length,
    },
    rows: rows.sort(compareKeywordRows),
  };
}

function compareKeywordRows(left, right) {
  if (left.yourBestPosition === null && right.yourBestPosition === null) {
    return left.keyword.localeCompare(right.keyword);
  }

  if (left.yourBestPosition === null) {
    return 1;
  }

  if (right.yourBestPosition === null) {
    return -1;
  }

  return left.yourBestPosition - right.yourBestPosition || left.keyword.localeCompare(right.keyword);
}

function getKeywordStatus(position) {
  if (!position) {
    return 'unranked';
  }

  if (position === 1) {
    return 'leader';
  }

  if (position <= 3) {
    return 'visible';
  }

  if (position <= 10) {
    return 'chasing';
  }

  return 'buried';
}

function deriveProjectStatus(latestRun, analysis) {
  if (!latestRun) {
    return 'idle';
  }

  if (analysis?.summary?.outrankEventCount) {
    return 'at-risk';
  }

  return 'stable';
}

function normalizeDomain(value) {
  try {
    return new URL(String(value || '').startsWith('http') ? value : `https://${value}`).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return String(value || '').replace(/^www\./i, '').trim().toLowerCase();
  }
}

function unique(values) {
  return [...new Set(values)];
}

function buildOutrankPlan(projectConfig, keywordPerformance, analysis) {
  const rows = keywordPerformance.rows || [];
  const outrankEvents = analysis?.outrankEvents || [];
  const primaryLocation = inferPrimaryLocation(projectConfig);
  const locationKeywords = rows.filter((row) => isLocalKeyword(row) && matchesFocusLocation(row, primaryLocation));
  const aiVisibilityKeywords = rows.filter((row) => isAeoKeyword(row));
  const closeWins = buildCloseWinKeywords(rows, primaryLocation);

  return {
    summary: {
      priorityKeywordCount: closeWins.length,
      localKeywordCount: locationKeywords.length,
      answerEngineKeywordCount: aiVisibilityKeywords.length,
      activeThreatCount: outrankEvents.length,
    },
    pillars: [
      {
        id: 'seo',
        title: 'SEO Outrank Plays',
        description: 'Win more classic organic positions by tightening keyword-targeted landing pages and internal support.',
        opportunities: pickKeywords(closeWins, () => true, 5),
        moves: [
          'Tighten title and H1 alignment on the pages tied to slipping commercial keywords.',
          'Expand depth on pages where ranking pages cover the topic more comprehensively than you do.',
          'Push stronger internal links into pages sitting outside the top 3.',
          'Refresh older ranking pages that are losing to newer documents.',
        ],
      },
      {
        id: 'geo',
        title: 'GEO Outrank Plays',
        description: 'Defend and expand local-intent coverage so your city and service-area pages become the default regional answer.',
        opportunities: pickKeywords(closeWins.filter((row) => isLocalKeyword(row)), () => true, 5),
        moves: [
          'Create or deepen city/service pages for every location keyword where you are not clearly #1.',
          'Add location proof: case studies, reviews, service-area examples, and local business details.',
          'Use Service, LocalBusiness, and FAQ schema on local landing pages where appropriate.',
          'Strengthen entity consistency between site pages, Google Business Profile, and citations.',
        ],
      },
      {
        id: 'aeo',
        title: 'AEO Outrank Plays',
        description: 'Increase answer-engine selection odds with explicit Q&A structure, definitions, and machine-readable page signals.',
        opportunities: pickKeywords(closeWins.filter((row) => isAeoKeyword(row)), () => true, 5),
        moves: [
          'Add concise answer blocks for core questions each page should resolve in the first screenful.',
          'Expand FAQ coverage around process, timing, pricing, differences, and outcomes.',
          'Use schema and cleaner entity framing so LLMs and search features can parse the page faster.',
          'Add proof-rich comparison, methodology, and use-case sections that make the page quotable.',
        ],
      },
    ],
    eventActions: outrankEvents.slice(0, 6).map((event) => ({
      keyword: event.keyword,
      competitorDomain: event.competitorDomain,
      lane: inferLaneFromKeyword(event.keyword, event.location),
      actions: event.recommendedActions.map((action) => ({
        type: action.type,
        reason: action.reason,
      })),
    })),
  };
}

function pickKeywords(rows, predicate, limit) {
  return rows
    .filter(predicate)
    .slice(0, limit)
    .map((row) => ({
      keyword: row.keyword,
      location: row.location,
      position: row.yourBestPosition,
      occupant: row.topSerpOccupantDomain,
    }));
}

function isLocalKeyword(row) {
  const text = `${row.keyword || ''} ${row.location || ''}`.toLowerCase();
  return /(tampa|wesley chapel|lutz|st\. petersburg|st petersburg|land o' lakes|land o lakes|local|near me|fl\b|florida)/.test(text);
}

function isAeoKeyword(row) {
  const text = `${row.keyword || ''}`.toLowerCase();
  return /(ai|aeo|geo|chatgpt|answer engine|generative)/.test(text);
}

function inferLaneFromKeyword(keyword, location) {
  const text = `${keyword || ''} ${location || ''}`.toLowerCase();
  if (/(tampa|wesley chapel|lutz|st\. petersburg|st petersburg|land o' lakes|land o lakes|local|near me|fl\b|florida)/.test(text)) {
    return 'GEO';
  }

  if (/(ai|aeo|geo|chatgpt|answer engine|generative)/.test(text)) {
    return 'AEO';
  }

  return 'SEO';
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

function buildCloseWinKeywords(rows, primaryLocation) {
  return rows.filter((row) => {
    if (!matchesFocusLocation(row, primaryLocation)) {
      return false;
    }

    if (!isCommercialLocalOpportunity(row.keyword, row.location)) {
      return false;
    }

    if (!row.yourBestPosition) {
      return false;
    }

    return row.yourBestPosition >= 2 && row.yourBestPosition <= 10;
  });
}

function matchesFocusLocation(row, primaryLocation) {
  if (!primaryLocation) {
    return true;
  }

  return String(row.location || '').trim().toLowerCase() === String(primaryLocation).trim().toLowerCase();
}

function parseRunFileName(fileName) {
  const trimmed = String(fileName || '').replace(/\.json$/i, '');
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/);
  if (!match) {
    return trimmed;
  }

  const [, year, month, day, hour, minute, second, millis] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millis}Z`;
}

function getIntegrationStatus(env, gscStatus = null) {
  return {
    searchConsole: {
      configured: gscStatus ? gscStatus.configured : Boolean(
        env.LIVING_SEO_GSC_CLIENT_ID &&
        env.LIVING_SEO_GSC_CLIENT_SECRET &&
        env.LIVING_SEO_GSC_SITE_URL
      ),
      connected: gscStatus ? gscStatus.connected : false,
      property: gscStatus?.property || env.LIVING_SEO_GSC_SITE_URL || null,
      lastSyncAt: gscStatus?.lastSyncAt || null,
    },
    serp: {
      provider: env.LIVING_SEO_SERPER_API_KEY ? 'serper' : null,
      configured: Boolean(env.LIVING_SEO_SERPER_API_KEY),
    },
    telegram: {
      configured: Boolean(env.LIVING_SEO_TELEGRAM_BOT_TOKEN && env.LIVING_SEO_TELEGRAM_CHAT_ID),
    },
  };
}

function buildEffectiveCloseWins(serpCloseWins, gscCloseWins) {
  if (!gscCloseWins?.rows?.length) {
    return serpCloseWins;
  }

  return gscCloseWins.rows
    .filter((row) => isCommercialLocalOpportunity(row.query, gscCloseWins.primaryLocation))
    .filter((row) => row.position >= 4 && row.position <= 20)
    .map((row) => ({
      keyword: row.query,
      location: gscCloseWins.primaryLocation,
      device: 'gsc',
      yourBestPosition: Math.round(row.position * 10) / 10,
      status: row.position <= 3 ? 'visible' : row.position <= 10 ? 'chasing' : 'buried',
      topSerpOccupantDomain: extractDomain(row.page),
      topSerpOccupantPosition: null,
      topWatchedCompetitorDomain: null,
      topWatchedCompetitorName: null,
      topWatchedCompetitorPosition: null,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      source: 'gsc',
    }));
}

function buildLocalOpportunityKeywords(gscCloseWins, primaryLocation) {
  if (!gscCloseWins?.rows?.length) {
    return [];
  }

  return gscCloseWins.rows
    .filter((row) => isCommercialLocalOpportunity(row.query, primaryLocation || gscCloseWins.primaryLocation))
    .filter((row) => row.position >= 2 && row.position <= 40)
    .sort((left, right) => left.position - right.position || right.impressions - left.impressions)
    .slice(0, 25)
    .map((row) => ({
      keyword: row.query,
      location: primaryLocation || gscCloseWins.primaryLocation,
      device: 'gsc',
      yourBestPosition: Math.round(row.position * 10) / 10,
      status: row.position <= 3 ? 'visible' : row.position <= 10 ? 'chasing' : 'buried',
      topSerpOccupantDomain: extractDomain(row.page),
      topSerpOccupantPosition: null,
      topWatchedCompetitorDomain: null,
      topWatchedCompetitorName: null,
      topWatchedCompetitorPosition: null,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      source: 'gsc',
    }));
}

function buildPageCluster(projectConfig, rows, primaryLocation) {
  const keywordRows = Array.isArray(rows) ? rows : [];
  const clusterDefinitions = getPageClusterDefinitions(projectConfig, primaryLocation);

  const items = clusterDefinitions.map((definition) => {
    const row = keywordRows.find((entry) => String(entry.keyword || '').trim().toLowerCase() === definition.keyword.toLowerCase()) || null;

    return {
      keyword: definition.keyword,
      location: primaryLocation,
      pageLabel: definition.pageLabel,
      pagePath: definition.pagePath,
      lane: definition.lane,
      yourBestPosition: row?.yourBestPosition ?? null,
      status: row?.status || 'unranked',
      topSerpOccupantDomain: row?.topSerpOccupantDomain || null,
      topSerpOccupantPosition: row?.topSerpOccupantPosition || null,
      topWatchedCompetitorDomain: row?.topWatchedCompetitorDomain || null,
      topWatchedCompetitorName: row?.topWatchedCompetitorName || null,
      topWatchedCompetitorPosition: row?.topWatchedCompetitorPosition || null,
      tracked: Boolean(row),
    };
  });

  return {
    name: primaryLocation ? `${primaryLocation} page cluster` : 'Page cluster',
    location: primaryLocation,
    items,
    summary: {
      trackedCount: items.filter((item) => item.tracked).length,
      top3Count: items.filter((item) => item.yourBestPosition && item.yourBestPosition <= 3).length,
      unrankedCount: items.filter((item) => !item.yourBestPosition).length,
    },
  };
}

function getPageClusterDefinitions(projectConfig, primaryLocation) {
  const keywordSet = new Set((projectConfig.keywords || []).map((entry) => String(entry.keyword || '').trim().toLowerCase()));
  const wesleyChapelDefaults = [
    {
      keyword: 'wesley chapel ai visibility consultant',
      pageLabel: 'Wesley Chapel AI visibility consulting page',
      pagePath: '/wesley-chapel-marketing-consultant',
      lane: 'SEO',
    },
    {
      keyword: 'ai visibility consulting wesley chapel',
      pageLabel: 'Wesley Chapel AI visibility consulting page',
      pagePath: '/wesley-chapel-marketing-consultant',
      lane: 'SEO',
    },
    {
      keyword: 'local seo visibility audit wesley chapel',
      pageLabel: 'Local SEO, GEO, and AEO Visibility Audit',
      pagePath: '/local-seo-visibility-audit',
      lane: 'SEO',
    },
    {
      keyword: 'generative engine optimization wesley chapel',
      pageLabel: 'GEO for Local Businesses',
      pagePath: '/geo-for-local-businesses',
      lane: 'GEO',
    },
    {
      keyword: 'answer engine optimization wesley chapel',
      pageLabel: 'AEO for Local Businesses',
      pagePath: '/aeo-for-local-businesses',
      lane: 'AEO',
    },
  ];

  const defaults = /wesley chapel/i.test(primaryLocation || '') ? wesleyChapelDefaults : [];
  const matchedDefaults = defaults.filter((entry) => keywordSet.has(entry.keyword));
  if (matchedDefaults.length) {
    return matchedDefaults;
  }

  return (projectConfig.keywords || [])
    .filter((entry) => matchesFocusLocation(entry, primaryLocation))
    .slice(0, 5)
    .map((entry) => ({
      keyword: entry.keyword,
      pageLabel: 'Primary tracked page',
      pagePath: null,
      lane: inferLaneFromKeyword(entry.keyword, entry.location),
    }));
}

function isCommercialLocalOpportunity(keyword, location) {
  const text = `${keyword || ''} ${location || ''}`.toLowerCase();
  const hasLocalModifier = /(wesley chapel|tampa|lutz|st\. petersburg|st petersburg|land o' lakes|land o lakes|fl\b|florida)/.test(text);
  const hasCommercialIntent = /(consultant|consulting|marketing|seo|optimization|audit|visibility|service|services|agency)/.test(text);
  const hasInformationalPattern = /(how to|what is|ranking factors|guide|tips|reddit|linkedin)/.test(text);

  return hasLocalModifier && hasCommercialIntent && !hasInformationalPattern;
}

function extractDomain(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}
