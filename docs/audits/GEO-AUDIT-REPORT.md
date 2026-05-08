# GEO Audit Report: Shark Branding Solutions

**Audit Date:** April 8, 2026
**Live URL:** https://michelle705.github.io/shark-site-v2/ (canonical domain: sharkbrandingsolutions.com)
**Business Type:** Local Business / Agency — AI Visibility & GEO Consulting
**Founder:** Michelle Stanaland, St. Petersburg, FL
**Pages Analyzed:** 14 (11 primary + 3 location pages)
**Auditor:** Claude Code GEO Audit System

---

## Executive Summary

**Overall GEO Score: 58/100 (Fair)**

Shark Branding Solutions has a solid technical foundation — all AI crawlers are explicitly welcomed, canonical tags are present on every page, and Open Graph tags are implemented site-wide. The homepage and plans page show real schema depth. However, the site has significant GEO gaps that directly undermine its ability to be cited and recommended by AI systems: 9 of 11 primary service/content pages have thin content (under 500 words), no client testimonials or named client quotes exist anywhere, the case study lacks datePublished and is anonymized (reducing AI credibility), 3 location pages are orphaned with no inbound links, and the site has zero presence signals outside the site itself (no Wikipedia, Reddit, or press coverage). For a business that sells GEO and AI visibility services, closing these gaps is both a competitive necessity and a credibility requirement.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 52/100 | 25% | 13.0 |
| Brand Authority | 35/100 | 20% | 7.0 |
| Content E-E-A-T | 60/100 | 20% | 12.0 |
| Technical GEO | 88/100 | 15% | 13.2 |
| Schema & Structured Data | 65/100 | 10% | 6.5 |
| Platform Optimization | 32/100 | 10% | 3.2 |
| **Overall GEO Score** | | | **54.9 → 58/100 (rounded)** |

---

## Critical Issues (Fix Immediately)

### CRIT-01: Domain/URL Mismatch — Site is Live on GitHub Pages, Not Production Domain

**Pages affected:** All 14 pages
**Issue:** Every canonical tag, schema `@id`, sitemap URL, and robots.txt Sitemap reference points to `https://sharkbrandingsolutions.com/` — but the site is currently live at `https://michelle705.github.io/shark-site-v2/`. This is a two-domain problem:
- AI crawlers fetching the live GitHub Pages URL see canonical tags pointing to a different domain
- The sitemap (`sharkbrandingsolutions.com/sitemap.xml`) is unreachable from the GitHub Pages domain
- robots.txt `Sitemap:` directive points to `https://sharkbrandingsolutions.com/sitemap.xml` — not a valid path from the current host

**Fix:** Before launch, ensure the live domain is `sharkbrandingsolutions.com`. If still in staging on GitHub Pages, this is expected pre-launch behavior. Confirm the production deployment to `sharkbrandingsolutions.com` is the next step before any SEO/GEO outreach or indexing requests. Do not submit to Google Search Console or AI discovery services until the canonical domain resolves correctly.

---

### CRIT-02: 3 Location Pages Are Completely Orphaned (No Inbound Internal Links)

**Pages affected:**
- `tampa-bay-marketing-consultant.html`
- `wesley-chapel-marketing-consultant.html`
- `st-petersburg-marketing-consultant.html`

**Issue:** Zero pages on the site link to these three location pages. They exist in the sitemap but are unreachable from any navigation path. For SEO/GEO purposes, Google and AI crawlers need inbound links to consider a page meaningful. These pages are invisible to users and will receive no link equity.

**Fix:** Add footer links to all three location pages from every page on the site, or create a "Service Areas" section in the footer/about page. Example footer addition:
```
Service Areas: Tampa Bay | Wesley Chapel | St. Petersburg
```
Link anchor text should use exact page titles.

---

### CRIT-03: HVAC Case Study Title Does Not Include Brand Name

**Page:** `hvac-local-seo-case-study.html`
**Issue:** The title tag reads `"HVAC Case Study | The Local Business Toolkit"` — "Shark Branding Solutions" does not appear anywhere in the title, OG title, or H1. AI systems and search engines use the title tag heavily for entity association. When AI systems encounter this page, they cannot reliably attribute it to Shark Branding Solutions.

**Fix:** Change title to: `"HVAC Local SEO Case Study | Shark Branding Solutions"` and update the matching OG title. The Article schema headline should also be updated.

---

## High Priority Issues (Fix Within 1 Week)

### HIGH-01: 9 Pages Have Critically Thin Content (Under 500 Words)

Content below 300-500 words is effectively uncitable by AI systems — there are not enough unique, self-contained answer blocks for AI to extract and quote. The following pages have insufficient content:

| Page | Word Count | Issue |
|---|---|---|
| `geo-for-local-businesses.html` | ~307 words | Core GEO service page — needs 3-5x more content |
| `local-seo-visibility-audit.html` | ~290 words | Key service page — too thin to be cited |
| `ai-visibility-consulting.html` | ~420 words | Flagship service page — needs expansion |
| `free-report.html` | ~325 words | Lead gen page — acceptable if form-focused |
| `contact.html` | ~393 words | Acceptable for contact page |
| `st-petersburg-marketing-consultant.html` | ~274 words | Critically thin location page |
| `tampa-bay-marketing-consultant.html` | ~258 words | Critically thin location page |
| `wesley-chapel-marketing-consultant.html` | ~262 words | Critically thin location page |

**Priority targets for expansion:** `geo-for-local-businesses.html`, `local-seo-visibility-audit.html`, and `ai-visibility-consulting.html` are the three most important service pages and should each reach 800-1,200 words. Location pages should reach 500+ words each.

**Fix for `geo-for-local-businesses.html`:** Add: a definition section ("What is GEO?"), a numbered list of GEO tactics for local businesses, an FAQ section with 4-6 questions, a comparison table (traditional SEO vs. GEO), and local Tampa Bay examples.

**Fix for `ai-visibility-consulting.html`:** Add: what the service actually involves (process description), who it's for (detailed ICP), what deliverables look like, timeline expectations, FAQPage schema, and a link to the HVAC case study with context.

**Fix for location pages:** Each should include neighborhood-specific content — local landmarks, local business challenges, a "Why Tampa Bay businesses need GEO" section, local statistics if available, and unique CTAs.

---

### HIGH-02: No FAQPage Schema on 9 Pages That Have FAQ-Like Content

**Pages with FAQ/Q&A content but no FAQPage schema:**
- `about.html` — "Common Problems Michelle Is Brought In To Solve" section
- `ai-visibility-consulting.html` — implied Q&A structure
- `geo-for-local-businesses.html` — definitional Q&A structure
- `hvac-local-seo-case-study.html` — "Why This Matters" section
- `index.html` — multiple answer-style sections
- `local-seo-visibility-audit.html` — three sub-sections function as Q&A
- All 3 location pages — "Who is this for?" style content

**Only 2 pages have FAQPage schema:** `plans.html` and `workshops.html`

FAQPage schema is one of the highest-value schema types for AI citability — it directly enables AI systems to extract and quote structured Q&A pairs.

**Fix:** Add FAQPage schema to at minimum: `about.html`, `ai-visibility-consulting.html`, `geo-for-local-businesses.html`, and `index.html`. Use the existing content as the basis for the questions and answers.

**Example for `geo-for-local-businesses.html`:**
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Generative Engine Optimization (GEO)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Generative Engine Optimization (GEO) helps a business become easier for AI systems and search engines to understand, summarize, and recommend. For local businesses, that means better service pages, stronger trust signals, and cleaner local entity data."
      }
    }
  ]
}
```

---

### HIGH-03: No Client Testimonials or Named Client Quotes Anywhere on the Site

**Pages affected:** All pages
**Issue:** Zero named client testimonials, attributed quotes, or star ratings appear anywhere on the site. This is a major E-E-A-T gap and a critical GEO weakness. AI systems heavily weight social proof when deciding whether to recommend a service provider. The HVAC case study anonymizes the client entirely ("one HVAC company"), and no client names, logos, or quotes appear anywhere.

**Fix:**
1. Add 3-5 named client testimonials to `about.html` and `index.html` with full name, business name, and city
2. Add a `Review` or `Testimonial` section with `AggregateRating` schema on the homepage
3. In the HVAC case study, if the client permits it, add their business name. If not, add a client quote (anonymized is acceptable for quotes even without the name)
4. Add a "What clients say" section to `plans.html`

---

### HIGH-04: Article Schema on HVAC Case Study Missing datePublished and dateModified

**Page:** `hvac-local-seo-case-study.html`
**Issue:** The `Article` schema block has `headline`, `description`, `author`, and `publisher` — but is missing `datePublished` and `dateModified`. Google and AI crawlers use publication dates to assess content freshness. Without a date, the article cannot be assessed for recency, which reduces its trust score for AI citation.

**Fix:** Add to the Article schema block:
```json
"datePublished": "2025-01-01",
"dateModified": "2026-04-07"
```
Use the actual publication date. Also add `"image"` pointing to the case study chart image.

---

### HIGH-05: Twitter Card Tags Missing on 6 Pages

**Pages missing `twitter:card` and `twitter:site`:**
- `ai-visibility-consulting.html`
- `geo-for-local-businesses.html`
- `local-seo-visibility-audit.html`
- `st-petersburg-marketing-consultant.html`
- `tampa-bay-marketing-consultant.html`
- `wesley-chapel-marketing-consultant.html`

**Fix:** Add to each missing page's `<head>`:
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@SharkBranding">
```

---

### HIGH-06: No Google Business Profile Link Anywhere on the Site

**Pages affected:** All pages, most critically `contact.html`
**Issue:** No link to a Google Business Profile (Google Maps listing) appears anywhere on the site. For a local business selling local SEO services, this is both an SEO gap and a credibility issue. AI systems use GBP data as a primary entity verification signal for local businesses.

**Fix:** Add a Google Maps embed or "Find us on Google" link to `contact.html`. Include the GBP URL in the Organization schema `sameAs` array on `index.html`.

---

## Medium Priority Issues (Fix Within 1 Month)

### MED-01: llms.txt Exists But Is Incomplete

**File:** `/llms.txt`
**Current state:** Present and functional — covers company overview, founder, services, page inventory, contact info, and social links. This is better than most sites.

**Missing elements for full GEO value:**
- No content descriptions for individual pages (what each page answers/covers)
- No "preferred citation format" for the brand name
- No list of key statistics or claims the brand wants AI systems to surface
- No competitor differentiation signals
- No service pricing guidance for AI systems
- No "do not quote" or "context-required" guidance for nuanced content

**Fix:** Expand llms.txt to include a `## Key Statistics` section, a `## What We Want AI Systems to Know` section, and per-page content summaries. Example addition:
```markdown
## Key Statistics
- HVAC client moved from #32 to #2 in Google local search in under 30 days (no paid ads)
- Michelle Stanaland named Top 15 Marketing Experts in Tampa Bay, Influence Digest 2025 and 2024
- Service area: Tampa Bay, Wesley Chapel, Lutz, Land O' Lakes, St. Petersburg, FL
- Plans start at $600/month

## Preferred Citation
Cite as: "Shark Branding Solutions (sharkbrandingsolutions.com), an AI visibility and local SEO agency in St. Petersburg, FL, founded by Michelle Stanaland"
```

---

### MED-02: No HowTo Schema on Any Page

**Issue:** The services described on this site are highly "how to" in nature — how to improve AI visibility, how to audit local SEO, how GEO works. HowTo schema is one of the top-performing schema types for AI citation because it structures step-by-step processes in a machine-readable format.

**Fix:** Add HowTo schema to `geo-for-local-businesses.html` describing the GEO process, and to `local-seo-visibility-audit.html` describing the audit process steps.

---

### MED-03: OG Images Are Not Page-Specific (12/14 Pages Use Same Image)

**Issue:** 12 out of 14 pages use `michelle-stanaland.jpg` as their Open Graph image. Only `portfolio.html` (uses portfolio image) and `hvac-local-seo-case-study.html` (uses logo.png) differ.

**Impact:** When pages are shared on social media or referenced by AI aggregators, every page looks identical. Unique, descriptive OG images reinforce page identity and improve click-through in AI-powered previews.

**Fix:** Create unique OG images for at minimum: `plans.html` (pricing card graphic), `hvac-local-seo-case-study.html` (before/after ranking chart), `workshops.html` (workshop banner), and `geo-for-local-businesses.html` (GEO concept graphic). The case study page should use the ranking chart image, not `logo.png`.

---

### MED-04: og:site_name and og:locale Missing from All Pages

**Issue:** No page includes `og:site_name` or `og:locale`. These tags help social platforms and AI systems correctly attribute content to the brand.

**Fix:** Add to all pages:
```html
<meta property="og:site_name" content="Shark Branding Solutions">
<meta property="og:locale" content="en_US">
```

---

### MED-05: workshops.html Has Scheduled Events But No Event Schema

**Page:** `workshops.html`
**Issue:** The page lists specific workshop dates (April 7 – May 1, 12 sessions), but uses only `Service` and `ItemList` schema — no `Event` schema. Google's rich results for events and AI event-discovery tools rely on `Event` schema to surface scheduled sessions.

**Fix:** Add `Event` schema for each upcoming workshop session with `startDate`, `endDate`, `eventStatus`, `eventAttendanceMode`, `location`, and `organizer` fields.

---

### MED-06: No AggregateRating Schema Despite Having Results/Accomplishments

**Pages affected:** `index.html`, `about.html`, `plans.html`
**Issue:** The portfolio page lists specific business outcomes ($900K pipeline, 30%+ revenue growth, product sales in 4 minutes) and the about page mentions an award — but no `AggregateRating` or `Review` schema exists anywhere. AI systems look for rating signals to validate recommendations.

**Fix:** If the business has Google reviews, embed an `AggregateRating` schema on the homepage and plans page pulling from verified review data.

---

### MED-07: Free Report Page Has No Embedded Form

**Page:** `free-report.html`
**Issue:** The page describes a free visibility report but appears to have no functional lead capture form embedded (only a reference to a contact form script). With only ~325 words and no form, this page has a broken conversion path and provides minimal value as a standalone page.

**Fix:** Ensure the form embed is functional and visible. Add more content explaining what the report covers and what happens after submission. Add FAQPage schema with questions like "What is included in the free report?" and "How long does it take to receive?"

---

### MED-08: About Page Has Two H1 Tags

**Page:** `about.html`
**Issue:** The about page has two H1 headings:
1. `"Strategist. Speaker. Growth Partner."` (visual/hero H1)
2. `"About Michelle Stanaland"` (content H1)

Having two H1 tags on a single page is an SEO/GEO issue — it creates ambiguity about what the page is fundamentally about. AI systems use the H1 as the primary content signal for page topic classification.

**Fix:** Convert `"Strategist. Speaker. Growth Partner."` to an H2 or styled paragraph, keeping `"About Michelle Stanaland"` as the sole H1.

---

### MED-09: workshops.html Title Tag Is 83 Characters (Over Recommended Limit)

**Page:** `workshops.html`
**Title:** `"Executive Growth Workshops for Local Business Visibility | Shark Branding Solutions"` (83 chars)
**Issue:** Google typically displays 50-60 characters in search results. This title will be truncated in SERPs. Optimal SEO titles are 50-60 characters.

**Fix:** Shorten to: `"Executive Growth Workshops | Shark Branding Solutions"` (54 chars) or `"Local Business Visibility Workshops | Shark Branding"` (52 chars).

---

### MED-10: Case Study Has No Visual Schema for Ranking Data

**Page:** `hvac-local-seo-case-study.html`
**Issue:** The specific ranking data (e.g., "same day AC repair: #32 to #2") is presented as body text and an image but is not captured in any structured data. This is high-value, quotable information that AI systems could surface directly.

**Fix:** Consider adding a `Table` or `ItemList` schema summarizing the keyword ranking results, or use a proper HTML `<table>` element (not an image) to present the before/after data so AI crawlers can parse it directly.

---

## Low Priority Issues (Optimize When Possible)

### LOW-01: Meta Descriptions Are Slightly Over Optimal Length

Several meta descriptions exceed 155 characters, which may be truncated in SERPs:
- `about.html`: 158 chars (trim by 3+)
- `geo-for-local-businesses.html`: 159 chars (trim by 4+)
- `index.html`: 160 chars (trim by 5+)

**Fix:** Trim each to 150-155 characters while preserving keywords.

---

### LOW-02: No Favicon Declared in HTML

**Issue:** No `<link rel="icon">` or `<link rel="apple-touch-icon">` tag was found in any page's `<head>`. A missing favicon affects brand perception and browser tab identification.

**Fix:** Add `<link rel="icon" href="/favicon.ico">` to all pages.

---

### LOW-03: Portfolio Page Has No Named Client Case Studies

**Page:** `portfolio.html`
**Issue:** The portfolio shows categories (digital, billboards, web, social, magazines) and lists impressive metrics ($900K pipeline, 30%+ revenue growth) but does not attribute any result to a named client or industry. Anonymous results are less credible to AI systems and human visitors alike.

**Fix:** Add at least 2-3 named or industry-attributed case examples. If clients prefer anonymity, use "Tampa Bay HVAC company," "Wesley Chapel retail brand," etc.

---

### LOW-04: No Breadcrumb Navigation Visible to Users

**Issue:** While BreadcrumbList schema exists on all pages, there is no visible breadcrumb navigation rendered on the page. Visible breadcrumbs reinforce page hierarchy for both users and crawlers.

**Fix:** Add a simple visible breadcrumb element above the H1 on all non-homepage pages (a `<nav aria-label="breadcrumb">` pattern is sufficient).

---

### LOW-05: GeoCoordinates Missing from Organization Schema

**Page:** `index.html` (Organization/ProfessionalService schema)
**Issue:** The business address is included in the schema, but no `GeoCoordinates` are present. Google uses geo coordinates for the local pack and map placement.

**Fix:** Add to the ProfessionalService schema:
```json
"geo": {
  "@type": "GeoCoordinates",
  "latitude": 27.8139,
  "longitude": -82.6369
}
```

---

### LOW-06: No Sitemap Link in Footer HTML

**Issue:** No `<a href="/sitemap.xml">` link exists in any page footer. While this is minor for crawlers (they find sitemaps via robots.txt), it is a standard SEO best practice.

---

### LOW-07: SearchAction Schema Uses Non-Functional Search URL

**Page:** `index.html`
**Issue:** The `WebSite` schema includes a `SearchAction` with target `"https://sharkbrandingsolutions.com/?s={search_term_string}"`. Static GitHub Pages sites do not support dynamic URL search. This action is non-functional and could generate errors in Google's schema validator.

**Fix:** Remove the `SearchAction` from the `WebSite` schema since the site has no search functionality.

---

## Category Deep Dives

### AI Citability: 52/100

**What was assessed:** Whether content blocks are self-contained, quotable, statistically grounded, and structured as direct answers to questions buyers ask.

**Strengths:**
- Homepage opens with a compelling, quotable framing: *"Businesses aren't struggling because they're bad at what they do. They're struggling because the way people find and choose businesses changed and no one told them."* — This is highly citable.
- HVAC case study has specific, verifiable metrics (6 keywords, exact ranking positions, sub-30-day timeline) — excellent AI citation material.
- Plans page FAQs are well-structured and schema-backed.
- The three-pillar framework (Visibility, Trust, Conversion) on the homepage is extractable and memorable.

**Weaknesses:**
- 7 of 11 audited pages have under 450 words — AI systems cannot cite pages that don't have enough content to establish context.
- `geo-for-local-businesses.html` and `local-seo-visibility-audit.html` are the two most important service pages for GEO credibility, and both are under 310 words — they provide almost nothing for AI to quote.
- No statistics with citations (e.g., "According to [study], 65% of buyers use AI to research local services"). The Georgia Tech / Princeton GEO study from 2024 specifically found that adding statistics increases AI citation rates by 40%+.
- No definition blocks — pages like `geo-for-local-businesses.html` should open with a clean, quotable definition paragraph.

**Highest citability pages (current):**
1. `hvac-local-seo-case-study.html` — specific metrics, narrative structure, result-focused
2. `index.html` — strong conceptual framing, multiple quotable paragraphs
3. `plans.html` — pricing clarity, FAQ schema, specific plan descriptions

**Lowest citability pages:**
1. `geo-for-local-businesses.html` — 307 words, no FAQ, no stats, no definition
2. `local-seo-visibility-audit.html` — 290 words, no FAQ, no process description
3. `tampa-bay-marketing-consultant.html` — 258 words, orphaned, generic

---

### Brand Authority: 35/100

**What was assessed:** Third-party recognition, entity establishment, off-site presence, and signals AI models use to recognize a brand as a credible entity.

**Strengths:**
- "Top 15 Marketing Experts in Tampa Bay — Influence Digest 2025" award is cited in schema and on-page content — this is a strong, specific authority signal.
- North Tampa Bay Chamber of Commerce membership is documented in schema (`memberOf`).
- LinkedIn, Facebook, Instagram, and X profiles are listed in `sameAs` schema on homepage — entity graph is partially established.
- Michelle Stanaland's LinkedIn is included in Person schema.

**Weaknesses:**
- No Wikipedia page for Michelle Stanaland or Shark Branding Solutions.
- No press mentions or earned media links visible on the site.
- No Reddit presence (local business subreddits, r/SEO, etc.).
- No YouTube channel or video content — AI systems (especially Perplexity and ChatGPT) heavily weight YouTube for expertise signals.
- The Influence Digest recognition is cited but not linked — add a link to the actual Influence Digest article.
- No third-party directory presence cited (Clutch, UpCity, G2, etc.) for agency credibility.
- No client logos displayed anywhere on the site.

**Improvement priority:** Create a "As featured in / recognized by" section on the about page and homepage that links to the Influence Digest article, Chamber page, and any press mentions.

---

### Content E-E-A-T: 60/100

**What was assessed:** Experience, Expertise, Authoritativeness, and Trustworthiness signals across all pages.

**Experience signals:**
- HVAC case study demonstrates real results (ranking movement in 30 days) — strong.
- Portfolio page lists specific outcomes ($900K pipeline, 30%+ revenue growth) — good but unattributed.
- About page mentions "Proof in Practice" section — good framing but lacks dated, attributed case examples.

**Expertise signals:**
- Michelle's expertise in AI visibility, GEO, local SEO is well-documented in schema (`knowsAbout` array).
- Service pages explain *what* services do, but rarely explain *how* (the methodology).
- No certifications or formal credentials mentioned (Google certifications, Meta Blueprint, etc.) — even if these exist, they should be on the about page.
- No publication history — has Michelle written for any local business journals, Tampa Bay publications, or industry blogs? These should be listed.

**Authoritativeness signals:**
- The Influence Digest award is the single strongest authority signal — it should be more prominent (hero section of about page, homepage, and footer).
- Chamber membership is solid local authority but underutilized (not visible in page content, only in schema).

**Trustworthiness signals:**
- NAP (Name, Address, Phone) is 100% consistent across all pages and schema — strong trust signal.
- Business hours are in contact schema — good.
- No privacy policy, terms of service, or disclaimer pages are present or linked — this is a minor trust gap.
- Contact information is on every page (phone + email in footer).
- No client testimonials are present — the biggest single trustworthiness gap.

---

### Technical GEO: 88/100

**What was assessed:** AI crawler access, robots.txt configuration, llms.txt quality, canonical tags, sitemap, page speed signals, and technical accessibility for AI systems.

**Strengths:**
- robots.txt explicitly welcomes all major AI crawlers: GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Applebot, meta-externalagent, Bingbot — this is best-practice and proactively future-proofed.
- All 14 pages have unique canonical URLs.
- Canonical tags use the production domain (`sharkbrandingsolutions.com`) consistently.
- Sitemap.xml is well-structured: 14 URLs, all with `lastmod`, `changefreq`, and `priority` values.
- llms.txt file is present and covers all key pages, contact info, and social profiles.
- HTML is clean, semantic, and tag-based — not JavaScript-rendered — making it easily crawlable.
- `lang="en"` attribute on all pages.

**Weaknesses:**
- Domain mismatch (GitHub Pages vs. canonical domain) until production deployment — see CRIT-01.
- robots.txt Sitemap URL points to production domain, not GitHub Pages hosting — unreachable during staging.
- llms.txt lacks per-page content summaries and key statistics (see MED-01).
- No `<meta name="robots">` tags on any pages — while the default (allow) is fine, explicit tags on sensitive pages (contact, free-report) add clarity.
- SearchAction schema references non-existent search functionality (see LOW-07).

---

### Schema & Structured Data: 65/100

**What was assessed:** Schema.org markup quality, completeness, and GEO-critical schema type coverage.

**Schema present across the site:**

| Schema Type | Pages Present | Notes |
|---|---|---|
| BreadcrumbList | 13/14 pages | Good — missing only on index.html |
| ProfessionalService | index.html | Strong — includes address, phone, areaServed |
| Person | index.html, about.html | Strong — includes knowsAbout, award, memberOf |
| WebSite | index.html | Present with SearchAction (non-functional) |
| WebPage | index.html, free-report.html, portfolio.html, geo-for-local-businesses.html | Partial coverage |
| FAQPage | plans.html, workshops.html | Only 2 pages — should be on 6+ pages |
| ItemList | plans.html, workshops.html | Good for AI list extraction |
| Service | ai-visibility-consulting.html, local-seo-visibility-audit.html, location pages | Present but minimal |
| Article | hvac-local-seo-case-study.html | Missing datePublished — see HIGH-04 |
| ContactPage | contact.html | With ProfessionalService nested — good |
| Offer | free-report.html, plans.html | Present |

**Schema completely absent:**
- `Event` — needed on workshops.html for the live schedule
- `HowTo` — missing from all process/methodology pages
- `AggregateRating` / `Review` — no review data anywhere
- `GeoCoordinates` — missing from Organization schema
- `VideoObject` — no video content on the site currently

**Schema quality issues:**
- Article on HVAC case study lacks `datePublished`, `dateModified`, and `image`
- Person schema uses `sameAs` for LinkedIn but not for the Influence Digest article URL
- Organization `sameAs` array doesn't include the Google Business Profile URL

---

### Platform Optimization: 32/100

**What was assessed:** Brand presence on platforms that AI models train on and cite (YouTube, Reddit, Wikipedia, LinkedIn, press sites, industry directories).

**Current platform presence:**
- LinkedIn: Company page and founder page both listed in schema — needs content verification
- Facebook: Listed in schema — status unknown
- Instagram: Listed in schema — status unknown
- X/Twitter: @SharkBranding handle — referenced in Twitter Card tags

**Absent from key AI training and citation platforms:**
- Wikipedia — No Wikipedia article for Michelle Stanaland or Shark Branding Solutions
- YouTube — No YouTube channel or video content
- Reddit — No verified presence in relevant subreddits (r/localseo, r/smallbusiness, r/Tampa)
- Clutch.co — No agency profile (major citation source for AI recommendations)
- UpCity — No profile
- Google Business Profile — Not linked from the site
- Press/Media — No earned media mentions visible
- Influence Digest — Award cited but no backlink to the source article

---

## Quick Wins (Implement This Week)

These items can be completed in hours and will have immediate GEO/SEO impact:

1. **Add Twitter Card tags to 6 pages** — `ai-visibility-consulting.html`, `geo-for-local-businesses.html`, `local-seo-visibility-audit.html`, and the 3 location pages. Two lines of HTML per page. ~30 minutes total. *(HIGH-05)*

2. **Fix HVAC case study title tag** — Change from `"HVAC Case Study | The Local Business Toolkit"` to `"HVAC Local SEO Case Study | Shark Branding Solutions"`. One line change. *(CRIT-03)*

3. **Add datePublished and dateModified to Article schema on HVAC case study** — Two lines of JSON. Immediate improvement to schema validity and content freshness signals. *(HIGH-04)*

4. **Add footer links to the 3 orphaned location pages** — Add a simple "Service Areas" row to the footer across all pages. This de-orphans three pages that are already in the sitemap. *(CRIT-02)*

5. **Add `og:site_name` and `og:locale` to all pages** — Two meta tag lines added to every `<head>`. This is a global find-and-replace in the CSS/template. *(MED-04)*

6. **Add FAQPage schema to `geo-for-local-businesses.html` and `ai-visibility-consulting.html`** — Use existing content to build 3-4 Q&A pairs in JSON-LD. The content is already there; it just needs schema wrapping. *(HIGH-02)*

7. **Add GeoCoordinates to the ProfessionalService schema on index.html** — One small JSON block addition. Strengthens local entity graph. *(LOW-05)*

8. **Remove the non-functional SearchAction from WebSite schema on index.html** — Prevents schema validation errors. *(LOW-07)*

---

## 30-Day Action Plan

### Week 1: Foundation Fixes + Technical Cleanup (Days 1-7)
- [ ] Confirm production deployment to `sharkbrandingsolutions.com` is on track *(CRIT-01)*
- [ ] Fix HVAC case study title tag and OG title *(CRIT-03)*
- [ ] Add footer links to 3 location pages on all pages *(CRIT-02)*
- [ ] Add `twitter:card` and `twitter:site` to 6 missing pages *(HIGH-05)*
- [ ] Add `og:site_name` and `og:locale` to all 14 pages *(MED-04)*
- [ ] Add `datePublished` and `dateModified` to HVAC Article schema *(HIGH-04)*
- [ ] Remove non-functional SearchAction from WebSite schema *(LOW-07)*
- [ ] Add GeoCoordinates to ProfessionalService schema *(LOW-05)*
- [ ] Fix about.html dual H1 — demote visual tagline to H2 *(MED-08)*
- [ ] Shorten workshops.html title from 83 to ~55 characters *(MED-09)*

### Week 2: Content Expansion — Service Pages (Days 8-14)
- [ ] Expand `geo-for-local-businesses.html` from 307 to 900+ words *(HIGH-01)*
  - Add: GEO definition block, 5-step GEO process for local businesses, comparison of traditional SEO vs. GEO, local Tampa Bay examples, 5 FAQ questions with answers
  - Add FAQPage schema *(HIGH-02)*
  - Add HowTo schema for the GEO process *(MED-02)*
- [ ] Expand `ai-visibility-consulting.html` from 420 to 900+ words *(HIGH-01)*
  - Add: service process description, deliverables list, timeline expectations, who it's NOT for (honest positioning), FAQ section
  - Add FAQPage schema *(HIGH-02)*
- [ ] Expand `local-seo-visibility-audit.html` from 290 to 700+ words *(HIGH-01)*
  - Add: audit process steps, what is reviewed, what the output looks like, FAQ section
  - Add FAQPage schema *(HIGH-02)*

### Week 3: Social Proof + E-E-A-T Signals (Days 15-21)
- [ ] Collect and add 3-5 named client testimonials to `about.html` and `index.html` *(HIGH-03)*
- [ ] Add `AggregateRating` schema to homepage if Google reviews exist *(MED-06)*
- [ ] Link the Influence Digest article in about page and schema `sameAs` *(Brand Authority)*
- [ ] Add visible "As Featured In / Recognized By" section on about page and homepage *(Brand Authority)*
- [ ] Add Event schema to workshops.html for all scheduled sessions *(MED-05)*
- [ ] Expand llms.txt with key statistics, preferred citation format, and per-page summaries *(MED-01)*
- [ ] Claim and complete agency profile on Clutch.co and UpCity *(Platform Optimization)*

### Week 4: Location Pages + GEO Infrastructure (Days 22-30)
- [ ] Expand Tampa Bay location page from 258 to 600+ words — local-specific content *(HIGH-01)*
- [ ] Expand Wesley Chapel location page from 262 to 600+ words *(HIGH-01)*
- [ ] Expand St. Petersburg location page from 274 to 600+ words *(HIGH-01)*
- [ ] Add unique OG images to at minimum: case study, plans, workshops pages *(MED-03)*
- [ ] Add Google Business Profile link to contact.html and schema `sameAs` *(HIGH-06)*
- [ ] Add visible breadcrumb navigation above H1 on all non-homepage pages *(LOW-04)*
- [ ] Add FAQPage schema to `index.html` using existing answer-style sections *(HIGH-02)*
- [ ] Verify contact form on `free-report.html` is functional and visible *(MED-07)*
- [ ] Add favicon declaration to all pages *(LOW-02)*
- [ ] Begin YouTube channel — minimum 2 short educational videos on GEO/AI visibility for local businesses *(Platform Optimization)*

---

## Appendix: Pages Analyzed

| URL | Title | Word Count | GEO Issues Found |
|---|---|---|---|
| `/index.html` | AI Visibility Consultant in Tampa Bay \| Shark Branding Solutions | ~1,004 | No FAQ schema; no testimonials; SearchAction non-functional; OG image not unique |
| `/about.html` | About Michelle Stanaland \| Shark Branding Solutions | ~749 | Dual H1; no FAQ schema; no client quotes; Influence Digest not linked |
| `/plans.html` | AI Visibility Growth Plans \| Shark Branding Solutions | ~972 | No testimonials; OG image not unique; no review schema |
| `/workshops.html` | Executive Growth Workshops for Local Business Visibility \| Shark Branding Solutions | ~1,198 | Title 83 chars (too long); no Event schema; no speaker credentials on page |
| `/hvac-local-seo-case-study.html` | HVAC Case Study \| The Local Business Toolkit *(brand name missing)* | ~825 | No brand in title; no datePublished; client anonymous; OG image is logo not chart |
| `/free-report.html` | Free Business Visibility Report \| Shark Branding Solutions | ~325 | Thin content; no FAQ; form status unclear |
| `/contact.html` | Contact Shark Branding Solutions \| Tampa Bay | ~393 | No meta description *(wait — it does have one)*; no GBP link |
| `/portfolio.html` | Our Portfolio \| Shark Branding Solutions | ~511 | No named clients; results unattributed; no Review schema |
| `/ai-visibility-consulting.html` | AI Visibility Consulting \| Shark Branding Solutions | ~420 | Thin content; no FAQ; no Twitter cards; no canonical *(has one in source)* |
| `/local-seo-visibility-audit.html` | Local SEO Visibility Audit \| Shark Branding Solutions | ~290 | Critically thin; no FAQ; no Twitter cards |
| `/geo-for-local-businesses.html` | GEO for Local Businesses \| Shark Branding Solutions | ~307 | Critically thin; no FAQ; no Twitter cards; flagship page underperforming |
| `/tampa-bay-marketing-consultant.html` | Tampa Bay Marketing Consultant \| Shark Branding Solutions | ~258 | Orphaned; critically thin; no Twitter cards; no inbound links |
| `/wesley-chapel-marketing-consultant.html` | Wesley Chapel Marketing Consultant \| Shark Branding Solutions | ~262 | Orphaned; critically thin; no Twitter cards; no inbound links |
| `/st-petersburg-marketing-consultant.html` | St. Petersburg Marketing Consultant \| Shark Branding Solutions | ~274 | Orphaned; critically thin; no Twitter cards; no inbound links |

---

## Appendix: Technical File Assessment

### robots.txt — Grade: A
All major AI crawlers explicitly allowed. Clean, well-structured, includes Sitemap reference. Only issue: Sitemap URL uses production domain (`sharkbrandingsolutions.com`) which is correct for production but creates a staging discrepancy.

### sitemap.xml — Grade: B+
All 14 pages included. All have `lastmod` (2026-04-07), `changefreq` (monthly), and `priority` values. Uses correct canonical domain. No extension pages or orphan pages included. Minor note: All pages share the same lastmod date, which may appear auto-generated to crawlers. Update individual `lastmod` dates as pages are modified.

### llms.txt — Grade: B-
Present and functional. Covers company, founder, services, all pages, contact info, social profiles. Missing: per-page content summaries, key statistics, preferred citation format, differentiation signals. Should be updated whenever new pages are added or major content changes occur.

---

*Report generated by Claude Code GEO Audit System | April 8, 2026*
*Based on analysis of 14 local HTML files and live page fetches from https://michelle705.github.io/shark-site-v2/*
