export function isTelegramConfigured(env = process.env) {
  return Boolean(env.LIVING_SEO_TELEGRAM_BOT_TOKEN && env.LIVING_SEO_TELEGRAM_CHAT_ID);
}

export async function sendTelegramMessage(text, options = {}) {
  const botToken = options.botToken || process.env.LIVING_SEO_TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId || process.env.LIVING_SEO_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram is not configured. Set LIVING_SEO_TELEGRAM_BOT_TOKEN and LIVING_SEO_TELEGRAM_CHAT_ID.');
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram send failed: ${response.status} ${body}`);
  }

  return response.json();
}

export function formatTelegramSummary(payload) {
  const analysis = payload.analysis || payload;
  const run = payload.run;
  const businessDomain = toDomain(payload.businessDomain || analysis.businessDomain || '');
  const lines = [];
  const summary = analysis.summary || {};
  const numberOneKeywords = getNumberOneKeywords(run, businessDomain);

  lines.push(`Living SEO: ${analysis.projectName}`);
  lines.push(`Tracked keywords: ${summary.trackedKeywordCount || 0}`);
  lines.push(`Outrank events: ${summary.outrankEventCount || 0}`);
  lines.push(`Climbing threats: ${summary.climbingThreatCount || 0}`);
  lines.push(`#1 rankings: ${numberOneKeywords.length}`);

  if (summary.affectedCompetitors?.length) {
    lines.push(`Competitors: ${summary.affectedCompetitors.join(', ')}`);
  }

  if (numberOneKeywords.length) {
    lines.push('');
    lines.push('Current #1 wins:');
    for (const keyword of numberOneKeywords.slice(0, 5)) {
      lines.push(`- ${keyword.keyword} (${keyword.location || 'default'})`);
    }
    if (numberOneKeywords.length > 5) {
      lines.push(`- plus ${numberOneKeywords.length - 5} more`);
    }
  }

  if (!analysis.outrankEvents?.length && !analysis.climbingThreatEvents?.length) {
    lines.push('');
    lines.push('Status: no new outrank events or climbing threats in the latest comparison window.');
    return lines.join('\n');
  }

  lines.push('');

  for (const event of analysis.outrankEvents.slice(0, 3)) {
    const topAction = event.recommendedActions?.find((action) => action?.title);
    lines.push(
      `Keyword: ${event.keyword} (${event.location || 'default'})`,
    );
    lines.push(
      `${event.competitorDomain} moved above you: ${event.previousPositions.competitor} -> ${event.currentPositions.competitor}; your position: ${event.previousPositions.yourSite} -> ${event.currentPositions.yourSite}`,
    );
    if (event.detectedChange?.changedSignals?.length) {
      lines.push(`Detected change: ${event.detectedChange.changedSignals.slice(0, 3).join(', ')}`);
    }
    if (topAction?.title) {
      lines.push(`Next move: ${topAction.title}`);
    }
    lines.push('');
  }

  if (analysis.outrankEvents.length > 3) {
    lines.push(`Additional outrank events: ${analysis.outrankEvents.length - 3}`);
  }

  if (analysis.climbingThreatEvents?.length) {
    lines.push('');
    lines.push('Climbing threats:');
    for (const event of analysis.climbingThreatEvents.slice(0, 3)) {
      lines.push(
        `- ${event.keyword}: ${event.competitorDomain} is now ${event.gapNow} position${event.gapNow === 1 ? '' : 's'} behind you (${event.previousPositions.competitor} -> ${event.currentPositions.competitor})`,
      );
    }
    if (analysis.climbingThreatEvents.length > 3) {
      lines.push(`- plus ${analysis.climbingThreatEvents.length - 3} more`);
    }
  }

  return lines.join('\n').trim();
}

function getNumberOneKeywords(run, businessDomain) {
  if (!run?.keywords?.length || !businessDomain) {
    return [];
  }

  return run.keywords
    .map((entry) => {
      const topResult = entry.results?.find((result) => Number(result.position) === 1);
      if (!topResult || toDomain(topResult.domain || topResult.url || '') !== businessDomain) {
        return null;
      }
      return {
        keyword: entry.keyword,
        location: entry.location,
      };
    })
    .filter(Boolean);
}

function toDomain(value) {
  return String(value || '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .trim()
    .toLowerCase();
}
