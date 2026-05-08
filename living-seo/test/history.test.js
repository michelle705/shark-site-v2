import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProjectFromRuns } from '../src/history.js';
import { DEMO_CONFIG } from '../src/project-config.js';
import { createFixtureProvider } from '../src/providers/fixture-provider.js';

test('buildProjectFromRuns merges previous and current runs into analyzer input', async () => {
  const previousProvider = createFixtureProvider({ scenario: 'previous' });
  const currentProvider = createFixtureProvider({ scenario: 'current' });

  const previousKeyword = await previousProvider.collectKeyword(DEMO_CONFIG.keywords[0]);
  const currentKeyword = await currentProvider.collectKeyword(DEMO_CONFIG.keywords[0]);

  const previousRun = {
    keywords: [previousKeyword],
    pageSnapshots: {
      [previousKeyword.results[0].url]: await previousProvider.getPageSnapshot(previousKeyword.results[0].url),
      [previousKeyword.results[1].url]: await previousProvider.getPageSnapshot(previousKeyword.results[1].url),
    },
  };

  const currentRun = {
    keywords: [currentKeyword],
    pageSnapshots: {
      [currentKeyword.results[0].url]: await currentProvider.getPageSnapshot(currentKeyword.results[0].url),
      [currentKeyword.results[1].url]: await currentProvider.getPageSnapshot(currentKeyword.results[1].url),
    },
  };

  const project = buildProjectFromRuns(DEMO_CONFIG, previousRun, currentRun);

  assert.equal(project.keywords[0].previous.length, 3);
  assert.equal(project.keywords[0].current.length, 3);
  assert.ok(project.pageSnapshots['https://clearwaterdigital.com/ai-visibility-consulting']);
});
