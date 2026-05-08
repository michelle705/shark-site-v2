function toDomain(value) {
  try {
    return new URL(value.startsWith('http') ? value : `https://${value}`).hostname.replace(/^www\./, '');
  } catch {
    return String(value || '').replace(/^www\./, '').trim().toLowerCase();
  }
}

function byDomain(entries = []) {
  return new Map(entries.map((entry) => [toDomain(entry.domain), entry]));
}

function unique(values) {
  return [...new Set(values)];
}

function percentDelta(previous, current) {
  if (!previous) {
    return current ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function diffPageSnapshots(previous = {}, current = {}) {
  previous = previous || {};
  current = current || {};

  const signals = [];

  if (previous.title !== current.title) {
    signals.push({
      type: 'title',
      summary: `Title changed from "${previous.title || ''}" to "${current.title || ''}"`,
      impact: 0.85,
    });
  }

  if (previous.metaDescription !== current.metaDescription) {
    signals.push({
      type: 'meta-description',
      summary: 'Meta description changed',
      impact: 0.35,
    });
  }

  if (previous.h1 !== current.h1) {
    signals.push({
      type: 'h1',
      summary: `H1 changed from "${previous.h1 || ''}" to "${current.h1 || ''}"`,
      impact: 0.7,
    });
  }

  const wordGrowth = percentDelta(previous.wordCount || 0, current.wordCount || 0);
  if (Math.abs(wordGrowth) >= 15) {
    signals.push({
      type: 'content-depth',
      summary: `Word count changed by ${wordGrowth}%`,
      impact: wordGrowth > 0 ? 0.9 : 0.2,
    });
  }

  const linkGrowth = percentDelta(previous.internalLinkCount || 0, current.internalLinkCount || 0);
  if (Math.abs(linkGrowth) >= 20) {
    signals.push({
      type: 'internal-linking',
      summary: `Internal link count changed by ${linkGrowth}%`,
      impact: linkGrowth > 0 ? 0.75 : 0.2,
    });
  }

  const previousTypes = new Set(previous.schemaTypes || []);
  const currentTypes = new Set(current.schemaTypes || []);
  const addedSchema = [...currentTypes].filter((value) => !previousTypes.has(value));
  if (addedSchema.length) {
    signals.push({
      type: 'schema',
      summary: `Added schema types: ${addedSchema.join(', ')}`,
      impact: 0.8,
    });
  }

  const faqDelta = (current.faqCount || 0) - (previous.faqCount || 0);
  if (faqDelta > 0) {
    signals.push({
      type: 'faq-expansion',
      summary: `FAQ blocks increased by ${faqDelta}`,
      impact: 0.65,
    });
  }

  const freshnessDelta = (previous.freshnessDays || 0) - (current.freshnessDays || 0);
  if (freshnessDelta >= 30) {
    signals.push({
      type: 'freshness',
      summary: `Page appears materially fresher (${previous.freshnessDays}d to ${current.freshnessDays}d)`,
      impact: 0.55,
    });
  }

  return {
    changed: signals.length > 0,
    signals,
    changeScore: signals.reduce((sum, signal) => sum + signal.impact, 0),
  };
}

function buildAction(type, reason, priority, draft = null) {
  return {
    type,
    priority,
    reason,
    automationLevel: draft ? 'safe-draft' : 'manual-review',
    draft,
  };
}

export function recommendResponse({ event, competitorDiff, yourCurrentPage, competitorCurrentPage }) {
  const actions = [];
  const keyword = event.keyword;

  if (competitorDiff.signals.some((signal) => signal.type === 'title' || signal.type === 'h1')) {
    actions.push(
      buildAction(
        'search-snippet-alignment',
        'Competitor aligned title and heading more directly to the keyword that overtook you.',
        1,
        {
          suggestedTitle: `${capitalize(keyword)} | Shark Branding Solutions`,
          suggestedH1: capitalize(keyword),
        },
      ),
    );
  }

  if (
    competitorDiff.signals.some((signal) => signal.type === 'content-depth') &&
    (competitorCurrentPage.wordCount || 0) > (yourCurrentPage.wordCount || 0) * 1.2
  ) {
    actions.push(
      buildAction(
        'content-expansion',
        'Competitor materially expanded page depth and now covers the topic more comprehensively.',
        1,
        {
          suggestedSections: [
            `What ${keyword} means for local businesses`,
            `How the process works`,
            `Case studies and proof points`,
            `Frequently asked questions`,
          ],
        },
      ),
    );
  }

  if (
    competitorDiff.signals.some((signal) => signal.type === 'schema') &&
    !new Set(yourCurrentPage.schemaTypes || []).has('Service')
  ) {
    actions.push(
      buildAction(
        'schema-gap',
        'Competitor added structured data that your page does not currently expose.',
        2,
        {
          addSchemaTypes: ['Service', 'FAQPage'],
        },
      ),
    );
  }

  if (
    competitorDiff.signals.some((signal) => signal.type === 'internal-linking') &&
    (competitorCurrentPage.internalLinkCount || 0) > (yourCurrentPage.internalLinkCount || 0) + 4
  ) {
    actions.push(
      buildAction(
        'internal-linking',
        'Competitor increased supporting internal links into the ranking page.',
        2,
      ),
    );
  }

  if (
    competitorDiff.signals.some((signal) => signal.type === 'faq-expansion') &&
    (competitorCurrentPage.faqCount || 0) > (yourCurrentPage.faqCount || 0)
  ) {
    actions.push(
      buildAction(
        'faq-coverage',
        'Competitor introduced more question-answer coverage on the page.',
        2,
        {
          suggestedFaqTopics: [
            `How long does ${keyword} take?`,
            `What affects rankings for ${keyword}?`,
            `How is this different from traditional SEO?`,
          ],
        },
      ),
    );
  }

  if ((yourCurrentPage.freshnessDays || 0) > 60 && competitorDiff.signals.some((signal) => signal.type === 'freshness')) {
    actions.push(
      buildAction(
        'freshness-refresh',
        'Competitor page was refreshed recently while your page appears older.',
        3,
      ),
    );
  }

  if (!actions.length) {
    actions.push(
      buildAction(
        'manual-investigation',
        'Ranking changed, but no strong on-page cause was isolated. Check backlinks, local signals, and SERP feature changes.',
        3,
      ),
    );
  }

  return actions.sort((left, right) => left.priority - right.priority);
}

export function analyzeProject(project) {
  const businessDomain = toDomain(project?.business?.domain || '');
  const watchedCompetitors = new Set(
    (project?.watchedCompetitors || []).map((entry) => toDomain(entry?.domain || entry)).filter(Boolean),
  );
  if (!businessDomain) {
    throw new Error('business.domain is required');
  }

  const outrankEvents = [];
  const climbingThreatEvents = [];

  for (const keywordSet of project.keywords || []) {
    const previousMap = byDomain(keywordSet.previous);
    const currentMap = byDomain(keywordSet.current);
    const yourPrevious = previousMap.get(businessDomain);
    const yourCurrent = currentMap.get(businessDomain);

    if (!yourPrevious || !yourCurrent) {
      continue;
    }

    for (const [domain, previousEntry] of previousMap.entries()) {
      if (domain === businessDomain) {
        continue;
      }

      const currentEntry = currentMap.get(domain);
      if (!currentEntry) {
        continue;
      }

      const competitorSnapshots = project.pageSnapshots?.[currentEntry.url] || {};
      const yourSnapshots = project.pageSnapshots?.[yourCurrent.url] || {};
      const competitorDiff = diffPageSnapshots(competitorSnapshots.previous, competitorSnapshots.current);
      const yourCurrentPage = yourSnapshots.current || {};
      const competitorCurrentPage = competitorSnapshots.current || {};
      const startedBelowYou = previousEntry.position > yourPrevious.position;
      const nowAboveYou = currentEntry.position < yourCurrent.position;
      const stillBelowYou = currentEntry.position > yourCurrent.position;
      const previousGap = previousEntry.position - yourPrevious.position;
      const currentGap = currentEntry.position - yourCurrent.position;
      const gapClosed = previousGap - currentGap;
      const competitorImproved = currentEntry.position < previousEntry.position;

      if (startedBelowYou && stillBelowYou && competitorImproved && currentGap > 0 && currentGap <= 2 && gapClosed >= 1) {
        climbingThreatEvents.push({
          keyword: keywordSet.keyword,
          location: keywordSet.location,
          competitorDomain: domain,
          watchedCompetitor: watchedCompetitors.has(domain),
          competitorUrl: currentEntry.url,
          yourUrl: yourCurrent.url,
          previousPositions: {
            yourSite: yourPrevious.position,
            competitor: previousEntry.position,
          },
          currentPositions: {
            yourSite: yourCurrent.position,
            competitor: currentEntry.position,
          },
          gapBefore: previousGap,
          gapNow: currentGap,
          gapChange: gapClosed,
          threatLevel: currentGap === 1 ? 'imminent' : 'approaching',
          detectedChange: competitorDiff,
          recommendedActions: recommendResponse({
            event: {
              keyword: keywordSet.keyword,
            },
            competitorDiff,
            yourCurrentPage,
            competitorCurrentPage,
          }),
        });
      }

      if (!startedBelowYou || !nowAboveYou) {
        continue;
      }

      outrankEvents.push({
        keyword: keywordSet.keyword,
        location: keywordSet.location,
        competitorDomain: domain,
        watchedCompetitor: watchedCompetitors.has(domain),
        competitorUrl: currentEntry.url,
        yourUrl: yourCurrent.url,
        previousPositions: {
          yourSite: yourPrevious.position,
          competitor: previousEntry.position,
        },
        currentPositions: {
          yourSite: yourCurrent.position,
          competitor: currentEntry.position,
        },
        rankDelta: yourCurrent.position - currentEntry.position,
        gapChange: gapClosed,
        detectedChange: competitorDiff,
        recommendedActions: recommendResponse({
          event: {
            keyword: keywordSet.keyword,
          },
          competitorDiff,
          yourCurrentPage,
          competitorCurrentPage,
        }),
      });
    }
  }

  const summary = {
    outrankEventCount: outrankEvents.length,
    climbingThreatCount: climbingThreatEvents.length,
    trackedKeywordCount: (project.keywords || []).length,
    watchedCompetitorCount: watchedCompetitors.size,
    watchedCompetitorEvents: outrankEvents.filter((event) => event.watchedCompetitor).length,
    watchedCompetitorThreats: climbingThreatEvents.filter((event) => event.watchedCompetitor).length,
    affectedCompetitors: unique(outrankEvents.map((event) => event.competitorDomain)),
    threateningCompetitors: unique(climbingThreatEvents.map((event) => event.competitorDomain)),
    autopilotReadyCount: outrankEvents.filter((event) =>
      event.recommendedActions.some((action) => action.automationLevel === 'safe-draft'),
    ).length,
  };

  return {
    generatedAt: new Date().toISOString(),
    projectName: project.projectName || 'Untitled project',
    businessDomain,
    summary,
    outrankEvents,
    climbingThreatEvents,
    guardrails: [
      'Do not auto-publish content changes without approval and before/after measurement.',
      'Use real SERP APIs or Search Console-derived landing page datasets in production instead of scraping raw Google HTML.',
      'Treat recommendations as probable causes, not proof of causality.',
      'Limit autopilot to drafting metadata, schema, FAQ ideas, and internal-link suggestions until outcome data is stable.',
    ],
  };
}

function capitalize(value) {
  const uppercaseTerms = new Set(['ai', 'seo', 'geo', 'faq', 'ga4', 'ppc', 'cms']);

  return String(value || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => {
      const clean = part.trim();
      const lower = clean.toLowerCase();
      if (uppercaseTerms.has(lower)) {
        return lower.toUpperCase();
      }
      return clean[0].toUpperCase() + clean.slice(1);
    })
    .join(' ');
}
