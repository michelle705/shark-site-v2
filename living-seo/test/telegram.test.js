import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTelegramSummary } from '../src/telegram.js';

test('formatTelegramSummary reports clear status when there are no outrank events', () => {
  const message = formatTelegramSummary({
    analysis: {
      projectName: 'Test Project',
      summary: {
        trackedKeywordCount: 12,
        outrankEventCount: 0,
        affectedCompetitors: [],
      },
      outrankEvents: [],
    },
    run: {
      keywords: [
        {
          keyword: 'ai visibility seo for local businesses',
          location: 'United States',
          results: [{ position: 1, domain: 'sharkbrandingsolutions.com' }],
        },
      ],
    },
    businessDomain: 'sharkbrandingsolutions.com',
  });

  assert.match(message, /Living SEO: Test Project/);
  assert.match(message, /Outrank events: 0/);
  assert.match(message, /#1 rankings: 1/);
  assert.match(message, /Current #1 wins:/);
  assert.match(message, /no new outrank events/i);
});

test('formatTelegramSummary includes top event details and next move', () => {
  const message = formatTelegramSummary({
    analysis: {
      projectName: 'Test Project',
      summary: {
        trackedKeywordCount: 12,
        outrankEventCount: 1,
        affectedCompetitors: ['competitor.com'],
      },
      outrankEvents: [
        {
          keyword: 'ai visibility seo wesley chapel',
          location: 'Wesley Chapel, FL',
          competitorDomain: 'competitor.com',
          previousPositions: { competitor: 4, yourSite: 2 },
          currentPositions: { competitor: 1, yourSite: 3 },
          detectedChange: { changedSignals: ['title', 'faq coverage'] },
          recommendedActions: [{ title: 'Expand answer-ready FAQ coverage' }],
        },
      ],
    },
    run: {
      keywords: [
        {
          keyword: 'ai visibility consultant tampa',
          location: 'Tampa, FL',
          results: [{ position: 1, domain: 'sharkbrandingsolutions.com' }],
        },
      ],
    },
    businessDomain: 'sharkbrandingsolutions.com',
  });

  assert.match(message, /competitor\.com moved above you/);
  assert.match(message, /Detected change: title, faq coverage/);
  assert.match(message, /Next move: Expand answer-ready FAQ coverage/);
  assert.match(message, /#1 rankings: 1/);
});
