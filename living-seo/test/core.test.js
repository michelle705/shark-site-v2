import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeProject, diffPageSnapshots } from '../src/core.js';
import { DEMO_PROJECT } from '../src/demo-data.js';

test('diffPageSnapshots detects multiple meaningful changes', () => {
  const diff = diffPageSnapshots(
    DEMO_PROJECT.pageSnapshots['https://clearwaterdigital.com/ai-visibility-consulting'].previous,
    DEMO_PROJECT.pageSnapshots['https://clearwaterdigital.com/ai-visibility-consulting'].current,
  );

  assert.equal(diff.changed, true);
  assert.ok(diff.signals.some((signal) => signal.type === 'title'));
  assert.ok(diff.signals.some((signal) => signal.type === 'schema'));
  assert.ok(diff.signals.some((signal) => signal.type === 'content-depth'));
});

test('diffPageSnapshots handles unavailable snapshots', () => {
  const diff = diffPageSnapshots(null, null);

  assert.equal(diff.changed, false);
  assert.deepEqual(diff.signals, []);
  assert.equal(diff.changeScore, 0);
});

test('analyzeProject flags a competitor that crossed from below to above', () => {
  const analysis = analyzeProject(DEMO_PROJECT);

  assert.equal(analysis.summary.outrankEventCount, 1);
  assert.equal(analysis.outrankEvents[0].competitorDomain, 'clearwaterdigital.com');
  assert.equal(analysis.outrankEvents[0].keyword, 'tampa ai visibility consultant');
});

test('analyzeProject flags a competitor that is climbing close behind', () => {
  const analysis = analyzeProject(DEMO_PROJECT);

  assert.equal(analysis.summary.climbingThreatCount, 1);
  assert.equal(analysis.climbingThreatEvents[0].competitorDomain, 'clearwaterdigital.com');
  assert.equal(analysis.climbingThreatEvents[0].keyword, 'how to rank on chatgpt for local business');
  assert.equal(analysis.climbingThreatEvents[0].threatLevel, 'imminent');
});

test('analyzeProject generates safe drafts instead of auto-publishing instructions', () => {
  const analysis = analyzeProject(DEMO_PROJECT);
  const actions = analysis.outrankEvents[0].recommendedActions;

  assert.ok(actions.some((action) => action.automationLevel === 'safe-draft'));
  assert.ok(actions.every((action) => action.automationLevel !== 'auto-publish'));
});
