import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProvider } from './collector.js';
import { addKeywordToProject, listProjectNames, loadProjectConfig } from './project-loader.js';
import { sendTelegramMessage } from './telegram.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data', 'telegram');
const offsetFile = path.join(dataDir, 'offset.json');
const chatSettingsFile = path.join(dataDir, 'chat-settings.json');
const statusFile = path.join(dataDir, 'poller-status.json');

export async function pollTelegramBot(options = {}) {
  const botToken = options.botToken || process.env.LIVING_SEO_TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Telegram bot token is required');
  }

  const offset = await readOffset();
  const updates = await fetchTelegramUpdates(botToken, offset);
  let nextOffset = offset;
  const handled = [];

  for (const update of updates) {
    nextOffset = Math.max(nextOffset, Number(update.update_id || 0) + 1);
    const handledResult = await safelyHandleTelegramUpdate(update, options);
    if (handledResult) {
      handled.push(handledResult);
    }
  }

  await writeOffset(nextOffset);
  await writePollerStatus({
    lastSuccessfulRunAt: new Date().toISOString(),
    lastProcessedUpdateId: nextOffset > 0 ? nextOffset - 1 : null,
    updateCount: updates.length,
    handledCount: handled.length,
  });

  return {
    ok: true,
    updateCount: updates.length,
    handledCount: handled.length,
    handled,
    nextOffset,
  };
}

export async function getTelegramPollerSnapshot(options = {}) {
  const botToken = options.botToken || process.env.LIVING_SEO_TELEGRAM_BOT_TOKEN;
  const defaultProject = options.defaultProject || process.env.LIVING_SEO_DEFAULT_PROJECT || 'shark-branding-solutions';
  const [offset, status, chatSettings] = await Promise.all([
    readOffset(),
    readPollerStatus(),
    readChatSettings(),
  ]);
  const fallbackLastSuccessfulRunAt = await readOffsetFileTimestamp();

  const pendingUpdates = botToken
    ? (await fetchTelegramUpdates(botToken, offset, { limit: 1 })).length > 0
    : null;

  const sourcesByProject = new Map();
  addProjectSource(sourcesByProject, defaultProject, 'default');

  for (const [chatId, projectName] of Object.entries(chatSettings)) {
    addProjectSource(sourcesByProject, projectName, `chat:${chatId}`);
  }

  const loadedProjects = [];
  for (const [projectName, sources] of sourcesByProject.entries()) {
    try {
      const projectConfig = await loadProjectConfig(projectName);
      loadedProjects.push({
        projectName,
        filePath: resolveProjectConfigPath(projectName),
        keywordCount: Array.isArray(projectConfig.keywords) ? projectConfig.keywords.length : 0,
        sources,
      });
    } catch (error) {
      loadedProjects.push({
        projectName,
        filePath: resolveProjectConfigPath(projectName),
        keywordCount: null,
        sources,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    ok: true,
    lastSuccessfulRunAt: status.lastSuccessfulRunAt || fallbackLastSuccessfulRunAt,
    lastProcessedUpdateId: typeof status.lastProcessedUpdateId === 'number'
      ? status.lastProcessedUpdateId
      : offset > 0
        ? offset - 1
        : null,
    pendingUpdates,
    loadedProjects,
    stateFiles: {
      offsetFile,
      chatSettingsFile,
      statusFile,
    },
  };
}

export function formatTelegramPollerSnapshot(snapshot) {
  const lines = [];
  lines.push('Living SEO Telegram poller snapshot');
  lines.push(`Last successful run: ${snapshot.lastSuccessfulRunAt || 'never'}`);
  lines.push(`Last processed update id: ${snapshot.lastProcessedUpdateId ?? 'none'}`);
  lines.push(`Pending updates: ${formatPendingUpdates(snapshot.pendingUpdates)}`);
  lines.push('');
  lines.push('Loaded keyword-set/config files:');

  for (const project of snapshot.loadedProjects) {
    const keywordLabel = typeof project.keywordCount === 'number'
      ? `${project.keywordCount} keywords`
      : 'unreadable';
    lines.push(`- ${project.projectName} (${keywordLabel})`);
    lines.push(`  ${project.filePath}`);
    lines.push(`  sources: ${project.sources.join(', ')}`);
    if (project.error) {
      lines.push(`  error: ${project.error}`);
    }
  }

  lines.push('');
  lines.push('State files:');
  lines.push(`- offset: ${snapshot.stateFiles.offsetFile}`);
  lines.push(`- chat settings: ${snapshot.stateFiles.chatSettingsFile}`);
  lines.push(`- status: ${snapshot.stateFiles.statusFile}`);

  return lines.join('\n');
}

export async function handleTelegramUpdate(update, options = {}) {
  const message = update?.message;
  const text = message?.text?.trim();
  const chatId = message?.chat?.id;

  if (!text || !chatId) {
    return null;
  }

  if (text === '/start' || text === '/help') {
    const helpText = [
      'Living SEO bot commands:',
      '/project list',
      '/project use project-slug',
      '/project current',
      '/keywords add "keyword" "location"',
      '/keywords add project-slug "keyword" "location"',
      '/top1 domain.com',
      '/top3 domain.com',
      '/wins domain.com',
      '/compare domain1.com domain2.com',
      '/top1 domain.com project-name',
      '',
      'Example:',
      '/top1 sharkbrandingsolutions.com shark-branding-solutions',
    ].join('\n');

    await sendTelegramMessage(helpText, {
      botToken: options.botToken,
      chatId,
    });

    return { command: 'help', chatId };
  }

  const lower = text.toLowerCase();
  const chatSettings = await readChatSettings();
  const selectedProject = chatSettings[String(chatId)] || options.defaultProject || process.env.LIVING_SEO_DEFAULT_PROJECT || 'shark-branding-solutions';

  if (lower.startsWith('/project list')) {
    const projectNames = await listProjectNames();
    await sendTelegramMessage(formatProjectListReply(projectNames, selectedProject), {
      botToken: options.botToken,
      chatId,
    });
    return {
      command: 'project-list',
      chatId,
      count: projectNames.length,
    };
  }

  if (lower.startsWith('/project current')) {
    await sendTelegramMessage(`Current project: ${selectedProject}`, {
      botToken: options.botToken,
      chatId,
    });
    return {
      command: 'project-current',
      chatId,
      projectName: selectedProject,
    };
  }

  if (lower.startsWith('/project use')) {
    const projectName = parseProjectUseCommand(text);
    await loadProjectConfig(projectName);
    chatSettings[String(chatId)] = projectName;
    await writeChatSettings(chatSettings);
    await sendTelegramMessage(`Active project set to ${projectName}`, {
      botToken: options.botToken,
      chatId,
    });
    return {
      command: 'project-use',
      chatId,
      projectName,
    };
  }

  if (lower.startsWith('/keywords add')) {
    const { projectName, keyword, location } = parseKeywordsAddCommand(text, selectedProject);
    const result = await addKeywordToProject(projectName, {
      keyword,
      location,
      device: 'desktop',
    });
    const reply = result.added
      ? `Added keyword to ${projectName}:\n- ${result.keywordConfig.keyword}\n- ${result.keywordConfig.location}`
      : `Keyword already exists in ${projectName}:\n- ${result.keywordConfig.keyword}\n- ${result.keywordConfig.location}`;
    await sendTelegramMessage(reply, {
      botToken: options.botToken,
      chatId,
    });
    return {
      command: 'keywords-add',
      chatId,
      projectName,
      added: result.added,
    };
  }

  if (lower.startsWith('/top1')) {
    const { domain, projectName } = parseSingleDomainCommand(text, selectedProject, '/top1');
    const results = await getRankedKeywordsForDomain(domain, projectName, options);
    const reply = formatRankReply(results, 1);

    await sendTelegramMessage(reply, {
      botToken: options.botToken,
      chatId,
    });

    return {
      command: 'top1',
      chatId,
      domain,
      projectName,
      count: results.top1Matches.length,
    };
  }

  if (lower.startsWith('/top3')) {
    const { domain, projectName } = parseSingleDomainCommand(text, selectedProject, '/top3');
    const results = await getRankedKeywordsForDomain(domain, projectName, options);
    const reply = formatRankReply(results, 3);

    await sendTelegramMessage(reply, {
      botToken: options.botToken,
      chatId,
    });

    return {
      command: 'top3',
      chatId,
      domain,
      projectName,
      count: results.top3Matches.length,
    };
  }

  if (lower.startsWith('/wins')) {
    const { domain, projectName } = parseSingleDomainCommand(text, selectedProject, '/wins');
    const results = await getRankedKeywordsForDomain(domain, projectName, options);
    const reply = formatWinsReply(results);

    await sendTelegramMessage(reply, {
      botToken: options.botToken,
      chatId,
    });

    return {
      command: 'wins',
      chatId,
      domain,
      projectName,
      count: results.matches.length,
    };
  }

  if (lower.startsWith('/compare')) {
    const { leftDomain, rightDomain, projectName } = parseCompareCommand(text, selectedProject);
    const result = await compareDomains(leftDomain, rightDomain, projectName, options);
    const reply = formatCompareReply(result);

    await sendTelegramMessage(reply, {
      botToken: options.botToken,
      chatId,
    });

    return {
      command: 'compare',
      chatId,
      leftDomain,
      rightDomain,
      projectName,
    };
  }

  return null;
}

async function safelyHandleTelegramUpdate(update, options = {}) {
  const chatId = update?.message?.chat?.id;

  try {
    return await handleTelegramUpdate(update, options);
  } catch (error) {
    if (chatId) {
      await sendTelegramMessage(
        error instanceof Error ? error.message : String(error),
        {
          botToken: options.botToken,
          chatId,
        },
      );
    }

    return {
      command: 'error',
      chatId,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function compareDomains(leftDomain, rightDomain, projectName, options = {}) {
  const left = await getRankedKeywordsForDomain(leftDomain, projectName, options);
  const right = await getRankedKeywordsForDomain(rightDomain, projectName, options);

  return {
    projectName: left.projectName,
    projectSlug: left.projectSlug,
    trackedKeywordCount: left.trackedKeywordCount,
    left: {
      domain: left.domain,
      top1Count: left.top1Matches.length,
      top3Count: left.top3Matches.length,
    },
    right: {
      domain: right.domain,
      top1Count: right.top1Matches.length,
      top3Count: right.top3Matches.length,
    },
    top1OnlyLeft: difference(left.top1Matches, right.top1Matches),
    top1OnlyRight: difference(right.top1Matches, left.top1Matches),
  };
}

export async function getRankedKeywordsForDomain(domain, projectName, options = {}) {
  const normalizedDomain = toDomain(domain);
  if (!normalizedDomain) {
    throw new Error('A valid domain is required');
  }

  const projectConfig = await loadProjectConfig(projectName);
  const provider = createProvider(options.provider || { name: 'serper' });
  const matches = [];
  const top1Matches = [];
  const top3Matches = [];

  for (const keywordConfig of projectConfig.keywords || []) {
    const snapshot = await provider.collectKeyword(keywordConfig);
    const domainResult = snapshot.results?.find((result) => toDomain(result.domain || result.url || '') === normalizedDomain);
    if (!domainResult) {
      continue;
    }

    const match = {
      keyword: keywordConfig.keyword,
      location: keywordConfig.location,
      url: domainResult.url,
      title: domainResult.title,
      position: Number(domainResult.position || 0),
    };

    matches.push(match);

    if (match.position === 1) {
      top1Matches.push(match);
    }

    if (match.position > 0 && match.position <= 3) {
      top3Matches.push(match);
    }
  }

  return {
    projectName: projectConfig.projectName,
    projectSlug: projectConfig.slug,
    domain: normalizedDomain,
    trackedKeywordCount: projectConfig.keywords?.length || 0,
    matches,
    top1Matches,
    top3Matches,
  };
}

export function formatRankReply(result, maxPosition) {
  const lines = [];
  lines.push(`Top #${maxPosition} keywords for ${result.domain}`);
  lines.push(`Keyword universe: ${result.projectName}`);
  lines.push(`Tracked keywords checked: ${result.trackedKeywordCount}`);
  const matches = maxPosition === 1 ? result.top1Matches : result.top3Matches;
  lines.push(`#${maxPosition} count: ${matches.length}`);

  if (!matches.length) {
    lines.push('');
    lines.push(`No current top ${maxPosition} rankings found in this tracked keyword set.`);
    return lines.join('\n');
  }

  lines.push('');
  for (const match of matches.slice(0, 10)) {
    lines.push(`- #${match.position} ${match.keyword} (${match.location || 'default'})`);
  }

  if (matches.length > 10) {
    lines.push(`- plus ${matches.length - 10} more`);
  }

  return lines.join('\n');
}

export function formatWinsReply(result) {
  const lines = [];
  lines.push(`Wins for ${result.domain}`);
  lines.push(`Keyword universe: ${result.projectName}`);
  lines.push(`Tracked keywords checked: ${result.trackedKeywordCount}`);
  lines.push(`Ranking wins found: ${result.matches.length}`);
  lines.push(`#1 count: ${result.top1Matches.length}`);
  lines.push(`Top 3 count: ${result.top3Matches.length}`);

  if (!result.matches.length) {
    lines.push('');
    lines.push('No tracked ranking wins found right now.');
    return lines.join('\n');
  }

  lines.push('');
  for (const match of result.matches.sort((a, b) => a.position - b.position).slice(0, 10)) {
    lines.push(`- #${match.position} ${match.keyword} (${match.location || 'default'})`);
  }

  if (result.matches.length > 10) {
    lines.push(`- plus ${result.matches.length - 10} more`);
  }

  return lines.join('\n');
}

export function formatCompareReply(result) {
  const lines = [];
  lines.push(`Compare: ${result.left.domain} vs ${result.right.domain}`);
  lines.push(`Keyword universe: ${result.projectName}`);
  lines.push(`Tracked keywords checked: ${result.trackedKeywordCount}`);
  lines.push(`${result.left.domain}: #1=${result.left.top1Count}, top3=${result.left.top3Count}`);
  lines.push(`${result.right.domain}: #1=${result.right.top1Count}, top3=${result.right.top3Count}`);

  if (result.top1OnlyLeft.length) {
    lines.push('');
    lines.push(`${result.left.domain} exclusive #1 wins:`);
    for (const match of result.top1OnlyLeft.slice(0, 5)) {
      lines.push(`- ${match.keyword} (${match.location || 'default'})`);
    }
  }

  if (result.top1OnlyRight.length) {
    lines.push('');
    lines.push(`${result.right.domain} exclusive #1 wins:`);
    for (const match of result.top1OnlyRight.slice(0, 5)) {
      lines.push(`- ${match.keyword} (${match.location || 'default'})`);
    }
  }

  return lines.join('\n');
}

export function formatProjectListReply(projectNames, selectedProject) {
  const lines = [];
  lines.push('Available projects:');
  for (const projectName of projectNames) {
    const marker = projectName === selectedProject ? ' (active)' : '';
    lines.push(`- ${projectName}${marker}`);
  }
  return lines.join('\n');
}

function parseSingleDomainCommand(text, defaultProject, commandName) {
  const parts = text.split(/\s+/).filter(Boolean);
  const domain = parts[1] || '';
  const projectName = parts[2] || defaultProject;

  if (!domain) {
    throw new Error(`Usage: ${commandName} domain.com [project-name]`);
  }

  return {
    domain,
    projectName,
  };
}

function parseCompareCommand(text, defaultProject) {
  const parts = text.split(/\s+/).filter(Boolean);
  const leftDomain = parts[1] || '';
  const rightDomain = parts[2] || '';
  const projectName = parts[3] || defaultProject;

  if (!leftDomain || !rightDomain) {
    throw new Error('Usage: /compare domain1.com domain2.com [project-name]');
  }

  return {
    leftDomain,
    rightDomain,
    projectName,
  };
}

function parseProjectUseCommand(text) {
  const parts = text.split(/\s+/).filter(Boolean);
  const projectName = parts[2] || '';
  if (!projectName) {
    throw new Error('Usage: /project use project-slug');
  }
  return projectName;
}

function parseKeywordsAddCommand(text, defaultProject) {
  const parts = text.match(/"[^"]+"|\S+/g) || [];
  const command = `${parts[0] || ''} ${parts[1] || ''}`.trim().toLowerCase();
  if (command !== '/keywords add') {
    throw new Error('Usage: /keywords add "keyword" "location"');
  }

  const stripped = parts.slice(2).map(stripWrappedQuotes);
  if (stripped.length === 2) {
    return {
      projectName: defaultProject,
      keyword: stripped[0],
      location: stripped[1],
    };
  }

  if (stripped.length >= 3) {
    return {
      projectName: stripped[0],
      keyword: stripped[1],
      location: stripped[2],
    };
  }

  throw new Error('Usage: /keywords add "keyword" "location" or /keywords add project-slug "keyword" "location"');
}

async function fetchTelegramUpdates(botToken, offset, options = {}) {
  const url = new URL(`https://api.telegram.org/bot${botToken}/getUpdates`);
  if (offset) {
    url.searchParams.set('offset', String(offset));
  }
  if (options.limit) {
    url.searchParams.set('limit', String(options.limit));
  }

  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || 'Failed to fetch Telegram updates');
  }

  return Array.isArray(payload.result) ? payload.result : [];
}

async function readOffset() {
  try {
    const raw = await readFile(offsetFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Number(parsed.offset || 0);
  } catch {
    return 0;
  }
}

async function writeOffset(offset) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(offsetFile, JSON.stringify({ offset }, null, 2));
}

async function readPollerStatus() {
  try {
    const raw = await readFile(statusFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writePollerStatus(status) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(statusFile, JSON.stringify(status, null, 2));
}

async function readOffsetFileTimestamp() {
  try {
    const details = await stat(offsetFile);
    return details.mtime.toISOString();
  } catch {
    return null;
  }
}

async function readChatSettings() {
  try {
    const raw = await readFile(chatSettingsFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeChatSettings(settings) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(chatSettingsFile, JSON.stringify(settings, null, 2));
}

function toDomain(value) {
  return String(value || '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .trim()
    .toLowerCase();
}

function difference(left, right) {
  const rightKeys = new Set(right.map((item) => `${item.keyword}::${item.location}`));
  return left.filter((item) => !rightKeys.has(`${item.keyword}::${item.location}`));
}

function stripWrappedQuotes(value) {
  return String(value || '').replace(/^"(.*)"$/s, '$1').trim();
}

function resolveProjectConfigPath(projectName) {
  if (!projectName || projectName === 'demo') {
    return 'in-memory demo config';
  }

  return path.join(__dirname, '..', 'projects', `${projectName}.json`);
}

function addProjectSource(sourcesByProject, projectName, source) {
  if (!projectName) {
    return;
  }

  const sources = sourcesByProject.get(projectName) || [];
  sources.push(source);
  sourcesByProject.set(projectName, sources);
}

function formatPendingUpdates(value) {
  if (value === true) {
    return 'yes';
  }

  if (value === false) {
    return 'no';
  }

  return 'unknown (Telegram bot token not configured)';
}
