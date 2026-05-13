function toCountryCode(location) {
  const normalized = String(location || '').toLowerCase();

  if (normalized.includes('united states') || normalized.includes(', us') || normalized.endsWith(' us')) {
    return 'us';
  }

  if (normalized.includes('united kingdom') || normalized.includes(' uk')) {
    return 'uk';
  }

  if (normalized.includes('canada')) {
    return 'ca';
  }

  if (normalized.includes('australia')) {
    return 'au';
  }

  return 'us';
}

function toLanguageCode() {
  return 'en';
}

function normalizeOrganicResult(entry) {
  let domain = '';
  const url = entry.link || '';

  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    domain = '';
  }

  return {
    position: Number(entry.position || 0),
    domain,
    url,
    title: entry.title || '',
  };
}

export function createSerperProvider({ apiKey } = {}) {
  if (!apiKey) {
    throw new Error('Serper provider requires LIVING_SEO_SERPER_API_KEY');
  }

  return {
    name: 'serper',
    async collectKeyword({ keyword, location, device }) {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          q: keyword,
          gl: toCountryCode(location),
          hl: toLanguageCode(location),
          num: 10,
          ...(device === 'mobile' ? { page: 1 } : {}),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || payload.error || `Serper request failed with ${response.status}`);
      }

      return {
        keyword,
        location,
        results: Array.isArray(payload.organic) ? payload.organic.map(normalizeOrganicResult) : [],
        metadata: {
          credits: payload.credits || null,
        },
      };
    },
    async getPageSnapshot() {
      return null;
    },
  };
}
