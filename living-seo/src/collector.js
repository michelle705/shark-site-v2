import { analyzeProject } from './core.js';
import { buildProjectFromRuns } from './history.js';
import { fetchPageSnapshot } from './page-snapshot.js';
import { DEMO_CONFIG } from './project-config.js';
import { createFixtureProvider } from './providers/fixture-provider.js';
import { createHttpJsonProvider } from './providers/http-json-provider.js';
import { createSerperProvider } from './providers/serper-provider.js';
import { ensureProjectStorage, readLatestRuns, saveRun, slugify } from './storage.js';
import { formatTelegramSummary, isTelegramConfigured, sendTelegramMessage } from './telegram.js';

export async function collectProject(projectConfig, options = {}) {
  const provider = createProvider(options.provider || { name: 'fixture', scenario: 'current' });
  const slug = projectConfig.slug || slugify(projectConfig.projectName);
  const keywords = [];
  const pageSnapshots = {};
  const urlsToFetch = new Set();

  for (const keywordConfig of projectConfig.keywords) {
    const snapshot = await provider.collectKeyword(keywordConfig);
    const limitedResults = snapshot.results.slice(0, projectConfig.snapshotRules?.topResultsPerKeyword || 3);
    keywords.push({
      keyword: keywordConfig.keyword,
      location: keywordConfig.location,
      device: keywordConfig.device || 'desktop',
      results: limitedResults,
    });

    for (const result of limitedResults) {
      if (result.url) {
        urlsToFetch.add(result.url);
      }
    }
  }

  for (const url of urlsToFetch) {
    const providerSnapshot = await provider.getPageSnapshot(url);
    pageSnapshots[url] = providerSnapshot || (await fetchPageSnapshot(url).catch(() => null));
  }

  const run = {
    collectedAt: new Date().toISOString(),
    provider: provider.name,
    projectName: projectConfig.projectName,
    business: projectConfig.business,
    keywords,
    pageSnapshots,
  };

  await ensureProjectStorage(slug, projectConfig);
  const filePath = await saveRun(slug, run);
  return {
    slug,
    filePath,
    run,
  };
}

export async function analyzeLatestRuns(projectConfig) {
  const slug = projectConfig.slug || slugify(projectConfig.projectName);
  const [previousRun, currentRun] = await readLatestRuns(slug, 2);

  if (!previousRun || !currentRun) {
    throw new Error('At least two stored runs are required before analysis');
  }

  return analyzeProject(buildProjectFromRuns(projectConfig, previousRun, currentRun));
}

export async function monitorProject(projectConfig, options = {}) {
  const provider = options.provider || { name: 'serper' };
  const collected = await collectProject(projectConfig, { provider });
  const analysis = await analyzeLatestRuns(projectConfig);
  let telegram = null;

  if (options.notifyTelegram && isTelegramConfigured(options.env)) {
    const message = formatTelegramSummary({
      analysis,
      run: collected.run,
      businessDomain: projectConfig.business?.domain,
    });
    const result = await sendTelegramMessage(message, {
      botToken: options.env?.LIVING_SEO_TELEGRAM_BOT_TOKEN,
      chatId: options.env?.LIVING_SEO_TELEGRAM_CHAT_ID,
    });
    telegram = {
      sent: true,
      message,
      result,
    };
  } else {
    telegram = {
      sent: false,
      configured: isTelegramConfigured(options.env),
    };
  }

  return {
    collected,
    analysis,
    telegram,
  };
}

export function createProvider(providerConfig) {
  if (providerConfig.name === 'fixture') {
    return createFixtureProvider({ scenario: providerConfig.scenario || 'current' });
  }

  if (providerConfig.name === 'http-json') {
    return createHttpJsonProvider({
      endpoint: providerConfig.endpoint || process.env.LIVING_SEO_SERP_ENDPOINT,
      apiKey: providerConfig.apiKey || process.env.LIVING_SEO_SERP_API_KEY,
    });
  }

  if (providerConfig.name === 'serper') {
    return createSerperProvider({
      apiKey: providerConfig.apiKey || process.env.LIVING_SEO_SERPER_API_KEY,
    });
  }

  throw new Error(`Unknown provider "${providerConfig.name}"`);
}

export function getDemoConfig() {
  return DEMO_CONFIG;
}
