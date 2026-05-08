import { DEMO_PROJECT } from '../demo-data.js';

function getDataset(scenario) {
  if (scenario === 'previous') {
    return DEMO_PROJECT.keywords.map((entry) => ({
      keyword: entry.keyword,
      location: entry.location,
      results: entry.previous,
    }));
  }

  return DEMO_PROJECT.keywords.map((entry) => ({
    keyword: entry.keyword,
    location: entry.location,
    results: entry.current,
  }));
}

function getPageSnapshot(url, scenario) {
  const snapshot = DEMO_PROJECT.pageSnapshots[url];
  if (!snapshot) {
    return null;
  }
  return snapshot[scenario] || null;
}

export function createFixtureProvider({ scenario = 'current' } = {}) {
  return {
    name: `fixture:${scenario}`,
    async collectKeyword({ keyword, location }) {
      const match = getDataset(scenario).find((entry) => entry.keyword === keyword && entry.location === location);
      if (!match) {
        return { keyword, location, results: [] };
      }

      return {
        keyword,
        location,
        results: match.results,
      };
    },
    async getPageSnapshot(url) {
      return getPageSnapshot(url, scenario);
    },
  };
}
