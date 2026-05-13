import { loadEnvFile } from './env.js';
import { analyzeLatestRuns, collectProject, getDemoConfig, monitorProject } from './collector.js';
import { loadProjectConfig } from './project-loader.js';
import { formatTelegramPollerSnapshot, getRankedKeywordsForDomain, getTelegramPollerSnapshot, pollTelegramBot } from './telegram-bot.js';

loadEnvFile();

const [, , command, arg] = process.argv;

try {
  if (command === 'collect-demo') {
    const scenario = arg || 'current';
    const result = await collectProject(getDemoConfig(), {
      provider: { name: 'fixture', scenario },
    });
    console.log(JSON.stringify({
      ok: true,
      action: 'collect-demo',
      scenario,
      slug: result.slug,
      filePath: result.filePath,
      keywordCount: result.run.keywords.length,
    }, null, 2));
    process.exit(0);
  }

  if (command === 'analyze-demo') {
    const result = await analyzeLatestRuns(getDemoConfig());
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  if (command === 'collect-live-demo') {
    const result = await collectProject(getDemoConfig(), {
      provider: { name: 'serper' },
    });
    console.log(JSON.stringify({
      ok: true,
      action: 'collect-live-demo',
      slug: result.slug,
      filePath: result.filePath,
      collectedAt: result.run.collectedAt,
      provider: result.run.provider,
    }, null, 2));
    process.exit(0);
  }

  if (command === 'collect-live-project') {
    const projectConfig = await loadProjectConfig(arg);
    const result = await collectProject(projectConfig, {
      provider: { name: 'serper' },
    });
    console.log(JSON.stringify({
      ok: true,
      action: 'collect-live-project',
      slug: result.slug,
      filePath: result.filePath,
      collectedAt: result.run.collectedAt,
      provider: result.run.provider,
      keywordCount: result.run.keywords.length,
    }, null, 2));
    process.exit(0);
  }

  if (command === 'analyze-project') {
    const projectConfig = await loadProjectConfig(arg);
    const result = await analyzeLatestRuns(projectConfig);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  if (command === 'monitor-project') {
    const projectConfig = await loadProjectConfig(arg);
    const result = await monitorProject(projectConfig, {
      provider: { name: 'serper' },
      notifyTelegram: true,
      env: process.env,
    });
    console.log(JSON.stringify({
      ok: true,
      action: 'monitor-project',
      slug: result.collected.slug,
      filePath: result.collected.filePath,
      collectedAt: result.collected.run.collectedAt,
      provider: result.collected.run.provider,
      outrankEventCount: result.analysis.summary.outrankEventCount,
      climbingThreatCount: result.analysis.summary.climbingThreatCount,
      telegramSent: result.telegram.sent,
    }, null, 2));
    process.exit(0);
  }

  if (command === 'top1-domain') {
    const domain = arg;
    const projectName = process.argv[4] || 'shark-branding-solutions';
    const result = await getRankedKeywordsForDomain(domain, projectName, {
      provider: { name: 'serper' },
    });
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  if (command === 'telegram-poll') {
    const result = await pollTelegramBot({
      botToken: process.env.LIVING_SEO_TELEGRAM_BOT_TOKEN,
      defaultProject: process.env.LIVING_SEO_DEFAULT_PROJECT || 'shark-branding-solutions',
      provider: { name: 'serper' },
    });
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  if (command === 'telegram-snapshot') {
    const result = await getTelegramPollerSnapshot({
      botToken: process.env.LIVING_SEO_TELEGRAM_BOT_TOKEN,
      defaultProject: process.env.LIVING_SEO_DEFAULT_PROJECT || 'shark-branding-solutions',
    });
    console.log(formatTelegramPollerSnapshot(result));
    process.exit(0);
  }

  console.error('Usage: node src/cli.js collect-demo [previous|current] | analyze-demo | collect-live-demo | collect-live-project <name> | analyze-project <name> | monitor-project <name> | top1-domain <domain> [project-name] | telegram-poll | telegram-snapshot');
  process.exit(1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
