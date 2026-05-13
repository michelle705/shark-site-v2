import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCompareReply,
  formatProjectListReply,
  formatRankReply,
  formatTelegramPollerSnapshot,
  formatWinsReply,
} from '../src/telegram-bot.js';

test('formatRankReply shows no results cleanly', () => {
  const message = formatRankReply({
    domain: 'example.com',
    projectName: 'Example Project',
    trackedKeywordCount: 15,
    top1Matches: [],
    top3Matches: [],
  }, 1);

  assert.match(message, /Top #1 keywords for example\.com/);
  assert.match(message, /#1 count: 0/);
  assert.match(message, /No current top 1 rankings found/i);
});

test('formatRankReply lists winning keywords', () => {
  const message = formatRankReply({
    domain: 'example.com',
    projectName: 'Example Project',
    trackedKeywordCount: 15,
    top1Matches: [
      { keyword: 'ai visibility seo', location: 'United States', position: 1 },
      { keyword: 'geo for local businesses', location: 'United States', position: 1 },
    ],
    top3Matches: [],
  }, 1);

  assert.match(message, /#1 count: 2/);
  assert.match(message, /ai visibility seo/);
  assert.match(message, /geo for local businesses/);
});

test('formatWinsReply summarizes ranking wins', () => {
  const message = formatWinsReply({
    domain: 'example.com',
    projectName: 'Example Project',
    trackedKeywordCount: 15,
    matches: [
      { keyword: 'ai visibility seo', location: 'United States', position: 1 },
      { keyword: 'geo for local businesses', location: 'United States', position: 3 },
    ],
    top1Matches: [{ keyword: 'ai visibility seo', location: 'United States', position: 1 }],
    top3Matches: [
      { keyword: 'ai visibility seo', location: 'United States', position: 1 },
      { keyword: 'geo for local businesses', location: 'United States', position: 3 },
    ],
  });

  assert.match(message, /Ranking wins found: 2/);
  assert.match(message, /#1 count: 1/);
  assert.match(message, /Top 3 count: 2/);
});

test('formatCompareReply summarizes domain comparison', () => {
  const message = formatCompareReply({
    projectName: 'Example Project',
    trackedKeywordCount: 15,
    left: { domain: 'left.com', top1Count: 2, top3Count: 4 },
    right: { domain: 'right.com', top1Count: 1, top3Count: 3 },
    top1OnlyLeft: [{ keyword: 'ai visibility seo', location: 'United States' }],
    top1OnlyRight: [{ keyword: 'geo for local businesses', location: 'United States' }],
  });

  assert.match(message, /Compare: left\.com vs right\.com/);
  assert.match(message, /left\.com: #1=2, top3=4/);
  assert.match(message, /right\.com exclusive #1 wins:/);
});

test('formatProjectListReply marks the active project', () => {
  const message = formatProjectListReply(
    ['project-a', 'project-b'],
    'project-b',
  );

  assert.match(message, /project-a/);
  assert.match(message, /project-b \(active\)/);
});

test('formatTelegramPollerSnapshot reports status and loaded configs', () => {
  const message = formatTelegramPollerSnapshot({
    lastSuccessfulRunAt: '2026-05-02T21:44:00.000Z',
    lastProcessedUpdateId: 412,
    pendingUpdates: true,
    loadedProjects: [
      {
        projectName: 'shark-branding-solutions',
        keywordCount: 17,
        filePath: 'C:\\fake\\shark-branding-solutions.json',
        sources: ['default', 'chat:7894784301'],
      },
    ],
    stateFiles: {
      offsetFile: 'C:\\fake\\offset.json',
      chatSettingsFile: 'C:\\fake\\chat-settings.json',
      statusFile: 'C:\\fake\\poller-status.json',
    },
  });

  assert.match(message, /Last successful run: 2026-05-02T21:44:00.000Z/);
  assert.match(message, /Last processed update id: 412/);
  assert.match(message, /Pending updates: yes/);
  assert.match(message, /shark-branding-solutions \(17 keywords\)/);
  assert.match(message, /sources: default, chat:7894784301/);
});
