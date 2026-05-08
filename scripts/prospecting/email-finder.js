#!/usr/bin/env node

const dns = require("node:dns").promises;
const fs = require("node:fs/promises");
const { URL } = require("node:url");

const USER_AGENT =
  "Mozilla/5.0 (compatible; EmailFinderBot/1.0; +https://example.com/bot)";
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi;
const COMMON_PATHS = [
  "/",
  "/contact",
  "/contact-us",
  "/about",
  "/about-us",
  "/team",
  "/people",
  "/staff",
];
const REJECT_LOCAL_PARTS = new Set([
  "noreply",
  "no-reply",
  "donotreply",
  "do-not-reply",
]);
const SEARCH_ENGINE_DOMAINS = [
  "bing.com",
  "r.bing.com",
  "duckduckgo.com",
  "google.com",
  "yahoo.com",
];

function parseArgs(argv) {
  const options = {
    delayMs: 400,
    format: "json",
    json: false,
    maxPages: 8,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }

    const [flag, inlineValue] = arg.split("=", 2);
    const value =
      inlineValue !== undefined && inlineValue !== ""
        ? inlineValue
        : argv[i + 1] && !argv[i + 1].startsWith("--")
          ? argv[++i]
          : undefined;

    switch (flag) {
      case "--name":
        options.name = value;
        break;
      case "--business":
        options.business = value;
        break;
      case "--domain":
        options.domain = normalizeDomain(value);
        break;
      case "--input":
        options.input = value;
        break;
      case "--output":
        options.output = value;
        break;
      case "--format":
        options.format = value || options.format;
        break;
      case "--delay-ms":
        options.delayMs = Number.parseInt(value, 10) || options.delayMs;
        break;
      case "--max-pages":
        options.maxPages = Number.parseInt(value, 10) || options.maxPages;
        break;
      case "--json":
        options.json = true;
        break;
      case "--help":
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${flag}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node scripts/prospecting/email-finder.js --name "Jane Smith" --business "Acme Roofing"
  node scripts/prospecting/email-finder.js --name "Jane Smith" --business "Acme Roofing" --domain acmeroofing.com --json
  node scripts/prospecting/email-finder.js --input data/email-finder/contacts.csv --output data/email-finder/results.json

Options:
  --name        Full contact name
  --business    Business name used for domain discovery
  --domain      Optional known business domain
  --input       CSV file with columns: name,business,domain
  --output      Optional output file path
  --format      Output format for bulk mode: json or csv (default: json)
  --delay-ms    Delay between requests in milliseconds (default: 400)
  --max-pages   Max public pages to scan once a domain is found (default: 8)
  --json        Print raw JSON output
  --help        Show this help

Optional enrichment:
  Set HUNTER_API_KEY to add Hunter domain search / email-finder results.`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeDomain(input) {
  if (!input) {
    return undefined;
  }

  const cleaned = input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

  return cleaned || undefined;
}

function normalizeBusinessName(value) {
  return (value || "")
    .toLowerCase()
    .replace(/\b(inc|llc|ltd|co|company|corp|corporation|pllc)\b/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeCsv(value) {
  const stringValue = value == null ? "" : String(value);
  if (!/[",\r\n]/.test(stringValue)) {
    return stringValue;
  }
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];
    const next = line[i + 1];

    if (character === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  fields.push(current);
  return fields.map((field) => field.trim());
}

async function loadBulkContacts(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("Input CSV must include a header row and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const nameIndex = headers.indexOf("name");
  const businessIndex = headers.indexOf("business");
  const domainIndex = headers.indexOf("domain");

  if (nameIndex === -1 || businessIndex === -1) {
    throw new Error('Input CSV must include "name" and "business" columns.');
  }

  return lines.slice(1).map((line, index) => {
    const row = parseCsvLine(line);
    return {
      rowNumber: index + 2,
      name: row[nameIndex] || "",
      business: row[businessIndex] || "",
      domain: normalizeDomain(domainIndex === -1 ? "" : row[domainIndex]),
    };
  });
}

function slugifyNamePart(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase();
}

function splitName(fullName) {
  const cleaned = slugifyNamePart(fullName || "");
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return {
    first: parts[0] || "",
    last: parts.length > 1 ? parts[parts.length - 1] : "",
    parts,
  };
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const results = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    results.push(item);
  }
  return results;
}

function sanitizeEmail(raw) {
  if (!raw) {
    return null;
  }

  const email = raw
    .trim()
    .replace(/^mailto:/i, "")
    .replace(/[),.;:]+$/g, "")
    .toLowerCase();

  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    return null;
  }

  const local = email.slice(0, atIndex);
  if (REJECT_LOCAL_PARTS.has(local)) {
    return null;
  }

  return email;
}

function extractEmails(html, domain) {
  const matches = html.match(EMAIL_REGEX) || [];
  const emails = matches
    .map(sanitizeEmail)
    .filter(Boolean)
    .filter((email) => !domain || email.endsWith(`@${domain}`));

  const mailtos = [];
  const mailtoRegex = /mailto:([^"'?#\s>]+)/gi;
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) {
    const email = sanitizeEmail(match[1]);
    if (email && (!domain || email.endsWith(`@${domain}`))) {
      mailtos.push(email);
    }
  }

  return Array.from(new Set([...emails, ...mailtos]));
}

function scoreScrapedEmail(email, domain, matchedName) {
  const local = email.split("@")[0];
  let confidence = domain && email.endsWith(`@${domain}`) ? 0.72 : 0.55;
  if (matchedName) {
    confidence += 0.18;
  }
  if (/^(info|hello|contact|support|sales|office|admin)$/.test(local)) {
    confidence -= 0.18;
  }
  return Math.max(0.1, Math.min(confidence, 0.95));
}

function generatePatterns(name, domain) {
  const { first, last } = splitName(name);
  if (!first || !domain) {
    return [];
  }

  const firstInitial = first[0];
  const lastInitial = last[0];
  const patterns = [
    `${first}@${domain}`,
    last ? `${first}.${last}@${domain}` : null,
    last ? `${first}${last}@${domain}` : null,
    last ? `${first}_${last}@${domain}` : null,
    last ? `${firstInitial}${last}@${domain}` : null,
    last ? `${firstInitial}.${last}@${domain}` : null,
    last ? `${first}${lastInitial}@${domain}` : null,
  ].filter(Boolean);

  return Array.from(new Set(patterns));
}

function matchNameInEmail(name, email) {
  const { first, last } = splitName(name);
  const local = email.split("@")[0];
  return Boolean(
    first &&
      local.includes(first) &&
      (!last || local.includes(last) || local.includes(last[0]))
  );
}

function inferPatternFromEmail(name, sampleEmail) {
  const { first, last } = splitName(name);
  if (!first || !last || !sampleEmail) {
    return null;
  }

  const [local, domain] = sampleEmail.split("@");
  const candidateRules = [
    { id: "first.last", value: `${first}.${last}` },
    { id: "firstlast", value: `${first}${last}` },
    { id: "first", value: first },
    { id: "f.last", value: `${first[0]}.${last}` },
    { id: "flast", value: `${first[0]}${last}` },
    { id: "firstl", value: `${first}${last[0]}` },
    { id: "first_last", value: `${first}_${last}` },
  ];

  const matchedRule = candidateRules.find((rule) => rule.value === local);
  if (!matchedRule) {
    return null;
  }

  return { id: matchedRule.id, email: `${matchedRule.value}@${domain}` };
}

function extractCandidateLinks(html, baseUrl) {
  const results = [];
  const linkRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      const label = url.pathname.toLowerCase();
      if (!/^https?:$/.test(url.protocol)) {
        continue;
      }
      if (!/contact|about|team|people|staff/.test(label)) {
        continue;
      }
      results.push(url.toString());
    } catch {
      // Ignore malformed URLs.
    }
  }

  return Array.from(new Set(results));
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.text();
}

async function canResolveMx(domain) {
  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

async function getRobotsRules(baseUrl) {
  try {
    const robotsUrl = new URL("/robots.txt", baseUrl).toString();
    const text = await fetchText(robotsUrl);
    const lines = text.split(/\r?\n/);
    const disallowed = [];
    let applies = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const [rawKey, ...rest] = trimmed.split(":");
      const key = rawKey.trim().toLowerCase();
      const value = rest.join(":").trim();
      if (key === "user-agent") {
        applies = value === "*";
      } else if (applies && key === "disallow" && value) {
        disallowed.push(value);
      }
    }

    return disallowed;
  } catch {
    return [];
  }
}

function isAllowedPath(pathname, disallowedPaths) {
  return !disallowedPaths.some((blocked) => pathname.startsWith(blocked));
}

async function discoverDomainFromBusiness(business) {
  const query = encodeURIComponent(`${business} official site`);
  const urls = [
    `https://html.duckduckgo.com/html/?q=${query}`,
    `https://duckduckgo.com/html/?q=${query}`,
    `https://www.bing.com/search?q=${query}`,
  ];

  for (const url of urls) {
    try {
      const html = await fetchText(url, {
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html",
        },
      });
      const linkMatches = [];
      const ddgResultRegex = /result__a" href="([^"]+)"/gi;
      let match;
      while ((match = ddgResultRegex.exec(html)) !== null) {
        linkMatches.push(match[1]);
      }

      const bingResultRegex = /<h2[^>]*><a[^>]*href="([^"]+)"/gi;
      while ((match = bingResultRegex.exec(html)) !== null) {
        linkMatches.push(match[1]);
      }

      const uddgRegex = /uddg=([^"&]+)/gi;
      while ((match = uddgRegex.exec(html)) !== null) {
        linkMatches.push(decodeURIComponent(match[1]));
      }

      const hrefRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
      while ((match = hrefRegex.exec(html)) !== null) {
        linkMatches.push(match[1]);
      }

       const protocolRelativeHrefRegex = /href=["'](\/\/[^"']+)["']/gi;
      while ((match = protocolRelativeHrefRegex.exec(html)) !== null) {
        linkMatches.push(`https:${match[1]}`);
      }

      const citeRegex = /<cite>(https?:\/\/)?([^<\s]+)<\/cite>/gi;
      while ((match = citeRegex.exec(html)) !== null) {
        linkMatches.push(`https://${match[2].replace(/^\/*/, "")}`);
      }

      const domains = linkMatches
        .map((href) => decodeSearchRedirect(href))
        .map((href) => {
          try {
            return normalizeDomain(new URL(href).hostname);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .filter(
          (domain) =>
            !SEARCH_ENGINE_DOMAINS.some(
              (searchDomain) =>
                domain === searchDomain || domain.endsWith(`.${searchDomain}`)
            )
        )
        .filter((domain) => !/facebook\.com$|linkedin\.com$|instagram\.com$|x\.com$/.test(domain));

      if (domains.length > 0) {
        return domains[0];
      }
    } catch {
      // Try the next search endpoint.
    }
  }

  return guessDomainFromBusinessName(business);
}

function decodeSearchRedirect(href) {
  try {
    const url = new URL(href.startsWith("//") ? `https:${href}` : href);
    const uddg = url.searchParams.get("uddg");
    if (uddg) {
      return decodeURIComponent(uddg);
    }

    const bingTarget = url.searchParams.get("u");
    if (bingTarget && /^a1/i.test(bingTarget)) {
      const encoded = bingTarget.slice(2).replace(/-/g, "+").replace(/_/g, "/");
      const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
      return Buffer.from(padded, "base64").toString("utf8");
    }
  } catch {
    return href;
  }

  return href;
}

function guessDomainFromBusinessName(business) {
  const normalized = normalizeBusinessName(business);
  if (!normalized) {
    return null;
  }

  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const compressed = parts.join("");
  const hyphenated = parts.join("-");
  const candidates = [
    `${compressed}.com`,
    `${hyphenated}.com`,
    `${compressed}.co`,
    `${hyphenated}.co`,
    `${compressed}.io`,
    `${compressed}.ai`,
  ];

  return candidates[0] || null;
}

async function scrapeDomain(domain, options) {
  const baseUrl = `https://${domain}`;
  const disallowedPaths = await getRobotsRules(baseUrl);
  const queue = COMMON_PATHS.map((path) => new URL(path, baseUrl).toString());
  const visited = new Set();
  const foundEmails = [];
  const scannedPages = [];

  while (queue.length > 0 && visited.size < options.maxPages) {
    const url = queue.shift();
    if (!url || visited.has(url)) {
      continue;
    }

    const parsed = new URL(url);
    if (!isAllowedPath(parsed.pathname, disallowedPaths)) {
      continue;
    }

    visited.add(url);

    try {
      const html = await fetchText(url);
      scannedPages.push(url);
      const pageEmails = extractEmails(html, domain);
      for (const email of pageEmails) {
        foundEmails.push({
          email,
          source: "web-scraping",
          sourceUrl: url,
          confidence: scoreScrapedEmail(
            email,
            domain,
            matchNameInEmail(options.name, email)
          ),
          verified: false,
        });
      }

      const extraLinks = extractCandidateLinks(html, url)
        .filter((href) => normalizeDomain(new URL(href).hostname) === domain)
        .filter((href) => !visited.has(href));
      queue.push(...extraLinks);
    } catch {
      // Skip failed page fetches.
    }

    if (queue.length > 0) {
      await sleep(options.delayMs);
    }
  }

  return {
    disallowedPaths,
    scannedPages,
    emails: uniqueBy(foundEmails, (item) => `${item.email}|${item.sourceUrl}`),
  };
}

async function resolveContact(contact, options) {
  if (!contact.name || !contact.business) {
    return {
      ...contact,
      domain: contact.domain || null,
      mxFound: false,
      scannedPages: [],
      robotsDisallow: [],
      results: [],
      error: "Missing name or business.",
    };
  }

  const domain = contact.domain || (await discoverDomainFromBusiness(contact.business));
  const mxFound = domain ? await canResolveMx(domain) : false;
  const scraped = domain
    ? await scrapeDomain(domain, { ...options, name: contact.name })
    : { scannedPages: [], disallowedPaths: [], emails: [] };
  const hunterResults = domain ? await queryHunter(contact.name, domain) : [];
  const guessed = domain
    ? buildGuesses(contact.name, domain, scraped.emails, mxFound)
    : [];

  const results = uniqueBy(
    [...hunterResults, ...scraped.emails, ...guessed],
    (item) => item.email
  ).sort((a, b) => b.confidence - a.confidence);

  return {
    name: contact.name,
    business: contact.business,
    domain,
    mxFound,
    scannedPages: scraped.scannedPages,
    robotsDisallow: scraped.disallowedPaths,
    results,
    rowNumber: contact.rowNumber,
  };
}

async function queryHunter(name, domain) {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey || !name || !domain) {
    return [];
  }

  const endpoint = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(
    domain
  )}&full_name=${encodeURIComponent(name)}&api_key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/json",
      },
    });
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const data = payload?.data;
    if (!data?.email) {
      return [];
    }

    return [
      {
        email: data.email.toLowerCase(),
        source: "hunter",
        confidence:
          typeof data.score === "number"
            ? Math.max(0.01, Math.min(data.score / 100, 0.99))
            : 0.85,
        verified: data.verification?.status === "valid",
        position: data.position || null,
      },
    ];
  } catch {
    return [];
  }
}

function buildGuesses(name, domain, discoveredEmails, hasMx) {
  const guesses = generatePatterns(name, domain).map((email) => ({
    email,
    source: "pattern-guessing",
    confidence: hasMx ? 0.38 : 0.18,
    verified: false,
  }));

  const matchedDiscovered = discoveredEmails.find((result) =>
    matchNameInEmail(name, result.email)
  );
  if (matchedDiscovered) {
    const inferred = inferPatternFromEmail(name, matchedDiscovered.email);
    if (inferred) {
      guesses.unshift({
        email: inferred.email,
        source: "pattern-guessing",
        confidence: 0.66,
        verified: false,
      });
    }
  }

  return uniqueBy(guesses, (item) => item.email);
}

function formatResults(result) {
  console.log(`Name: ${result.name}`);
  console.log(`Business: ${result.business}`);
  console.log(`Domain: ${result.domain || "not found"}`);
  console.log(`MX records: ${result.mxFound ? "yes" : "no"}`);
  console.log("");

  if (result.results.length === 0) {
    console.log("No candidate emails found.");
    return;
  }

  for (const item of result.results) {
    const verified = item.verified ? "verified" : "unverified";
    const confidence = `${Math.round(item.confidence * 100)}%`;
    const extra = item.sourceUrl ? ` via ${item.sourceUrl}` : "";
    console.log(
      `- ${item.email} | ${item.source} | ${confidence} | ${verified}${extra}`
    );
  }
}

function flattenBulkResults(items) {
  const rows = [];
  for (const item of items) {
    if (item.results.length === 0) {
      rows.push({
        rowNumber: item.rowNumber || "",
        name: item.name,
        business: item.business,
        domain: item.domain || "",
        mxFound: item.mxFound,
        email: "",
        source: "",
        confidence: "",
        verified: "",
        sourceUrl: "",
        error: item.error || "",
      });
      continue;
    }

    for (const result of item.results) {
      rows.push({
        rowNumber: item.rowNumber || "",
        name: item.name,
        business: item.business,
        domain: item.domain || "",
        mxFound: item.mxFound,
        email: result.email,
        source: result.source,
        confidence: result.confidence,
        verified: result.verified,
        sourceUrl: result.sourceUrl || "",
        error: item.error || "",
      });
    }
  }
  return rows;
}

function toCsv(rows) {
  const headers = [
    "rowNumber",
    "name",
    "business",
    "domain",
    "mxFound",
    "email",
    "source",
    "confidence",
    "verified",
    "sourceUrl",
    "error",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ];
  return lines.join("\n");
}

async function runBulkMode(options) {
  const contacts = await loadBulkContacts(options.input);
  const outputs = [];

  for (const contact of contacts) {
    outputs.push(await resolveContact(contact, options));
  }

  if (options.output) {
    const content =
      options.format === "csv"
        ? toCsv(flattenBulkResults(outputs))
        : JSON.stringify(outputs, null, 2);
    await fs.writeFile(options.output, content, "utf8");
  }

  if (options.json || !options.output || options.format === "json") {
    console.log(JSON.stringify(outputs, null, 2));
    return;
  }

  console.log(`Wrote ${outputs.length} contacts to ${options.output}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  if (options.input) {
    await runBulkMode(options);
    return;
  }

  if (!options.name || !options.business) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const payload = await resolveContact(
    {
      name: options.name,
      business: options.business,
      domain: options.domain,
    },
    options
  );

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  formatResults(payload);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
