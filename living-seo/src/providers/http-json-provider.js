function normalizeResult(entry, index) {
  const url = entry.url || entry.link || '';
  let domain = entry.domain || '';

  if (!domain && url) {
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      domain = '';
    }
  }

  return {
    position: Number(entry.position || entry.rank || index + 1),
    domain,
    url,
    title: entry.title || '',
  };
}

export function createHttpJsonProvider({ endpoint, apiKey, headers = {} } = {}) {
  if (!endpoint) {
    throw new Error('HTTP JSON provider requires an endpoint');
  }

  return {
    name: 'http-json',
    async collectKeyword({ keyword, location, device }) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
          ...headers,
        },
        body: JSON.stringify({
          keyword,
          location,
          device,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || `SERP provider failed with ${response.status}`);
      }

      const results = Array.isArray(payload.results) ? payload.results.map(normalizeResult) : [];
      return {
        keyword,
        location,
        results,
      };
    },
    async getPageSnapshot() {
      return null;
    },
  };
}
