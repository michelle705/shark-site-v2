function matchContent(value, expression) {
  const match = expression.exec(value);
  return match?.[1]?.trim() || '';
}

function countMatches(value, expression) {
  const matches = value.match(expression);
  return matches ? matches.length : 0;
}

function countInternalLinks(html, url) {
  let host = '';

  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 0;
  }

  const links = [...html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)].map((match) => match[1]);
  return links.filter((href) => {
    if (href.startsWith('/')) {
      return true;
    }
    try {
      return new URL(href).hostname.replace(/^www\./, '') === host;
    } catch {
      return false;
    }
  }).length;
}

function extractSchemaTypes(html) {
  const types = new Set();
  for (const match of html.matchAll(/"@type"\s*:\s*"([^"]+)"/gi)) {
    types.add(match[1]);
  }
  return [...types];
}

export async function fetchPageSnapshot(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'LivingSEO/0.1 (+https://localhost)',
    },
  });

  if (!response.ok) {
    throw new Error(`Page fetch failed for ${url} with ${response.status}`);
  }

  const html = await response.text();
  const title = matchContent(html, /<title[^>]*>([^<]*)<\/title>/i);
  const metaDescription = matchContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"]*)["']/i);
  const h1 = matchContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '').trim();
  const wordCount = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    url,
    title,
    metaDescription,
    h1,
    wordCount,
    internalLinkCount: countInternalLinks(html, url),
    faqCount: countMatches(html, /FAQ/gi),
    schemaTypes: extractSchemaTypes(html),
    freshnessDays: 0,
    collectedAt: new Date().toISOString(),
  };
}
