# Living SEO MVP

This folder is the first working slice of a future "Living SEO" SaaS product.

## What it does now

- accepts keyword ranking snapshots for your domain and competitor domains
- detects when a competitor that used to rank below you moves above you
- compares competitor page snapshots before and after the move
- produces a ranked response plan with guarded "safe draft" suggestions
- stores timestamped collection runs on disk and compares the latest two runs
- supports a pluggable SERP provider contract with a fixture provider and a generic HTTP JSON provider
- includes a first-class Serper provider for live Google organic result collection
- can send monitoring summaries to a Telegram bot
- can respond to Telegram `/top1 domain.com` commands using a tracked keyword set

## What it does not do yet

- collect live Google rankings
- fetch real competitor pages on a schedule
- write changes back into your site automatically
- prove causality between a competitor change and a ranking change

## Why this MVP shape is correct

The valuable moat is not "scrape Google and rewrite pages." That is brittle and unsafe.
The moat is:

1. reliable change detection on pages that matter
2. rank-flip attribution heuristics
3. response orchestration with tight guardrails
4. longitudinal outcome data so the system learns which actions actually recover rankings

## Local usage

```bash
cd living-seo
npm start
```

Then open:

```text
http://localhost:3017
```

Run tests:

```bash
cd living-seo
npm test
```

Collect the demo baseline and shifted run:

```bash
cd living-seo
npm run collect:demo:previous
npm run collect:demo:current
npm run analyze:demo
```

Collect live Google results with Serper:

```bash
cd living-seo
npm run collect:live:demo
```

By default, `living-seo/.env` is loaded automatically if present.

Collect a named project from `living-seo/projects/*.json`:

```bash
cd living-seo
npm run collect:live:shark
```

Run the full monitor flow for a project:

```bash
cd living-seo
npm run monitor:shark
```

That command:

- collects a fresh live run
- compares the latest two runs
- sends a Telegram summary if Telegram env vars are configured

Telegram configuration:

```env
LIVING_SEO_TELEGRAM_BOT_TOKEN=your_bot_token
LIVING_SEO_TELEGRAM_CHAT_ID=your_chat_id
```

Google Search Console configuration:

```env
LIVING_SEO_GSC_CLIENT_ID=your_google_oauth_client_id
LIVING_SEO_GSC_CLIENT_SECRET=your_google_oauth_client_secret
LIVING_SEO_GSC_SITE_URL=sc-domain:example.com
# optional; defaults to http://localhost:3017/api/gsc/connect/callback
LIVING_SEO_GSC_REDIRECT_URI=http://localhost:3017/api/gsc/connect/callback
```

For local desktop OAuth, create a Google OAuth client that can use the loopback callback above. After adding the env vars, use the dashboard buttons to:

1. Connect GSC
2. Sign in to Google in the browser
3. Sync GSC close wins for the selected project

To get the bot working end to end:

1. Create a bot with BotFather in Telegram
2. Start a chat with the bot, or add it to the target group
3. Get the target chat ID
4. Put the token and chat ID in `living-seo/.env`
5. Run `npm run monitor:shark`

Telegram command polling:

```bash
cd living-seo
npm run telegram:poll
```

Poller health snapshot:

```bash
cd living-seo
npm run telegram:snapshot
```

That command does not process updates. It reports:

- last successful poll time
- last processed Telegram update id
- whether Telegram currently has pending updates for the saved offset
- which project config files are active through the default project and saved chat selections

Supported command:

```text
/project list
/project use project-slug
/project current
/keywords add "keyword" "location"
/keywords add project-slug "keyword" "location"
/top1 domain.com
/top1 domain.com shark-branding-solutions
/top3 domain.com
/wins domain.com
/compare domain1.com domain2.com
```

These check domains against the project's tracked keywords and return:

- `/project list`: shows available tracked projects
- `/project use`: sets the active project for this Telegram chat
- `/project current`: shows the active project for this Telegram chat
- `/keywords add`: adds a keyword/location pair to the active project or named project
- `/top1`: keywords where the domain is currently `#1`
- `/top3`: keywords where the domain is currently in the top 3
- `/wins`: the domain's current tracked ranking wins with positions
- `/compare`: a side-by-side comparison of two domains in the same keyword set

For a plain-language operator guide, see [TELEGRAM-COMMANDS.md](C:\Users\Miche\Downloads\shark-site-v2\living-seo\TELEGRAM-COMMANDS.md).

## Production roadmap

### Phase 1

- integrate a specific SERP API adapter instead of the generic HTTP provider
- fetch changed competitor pages and normalize them into feature vectors
- fetch your page snapshots the same way

### Phase 2

- add connectors for Search Console, GA4, Cloudflare, WordPress, Shopify, Webflow
- generate draft fixes for title, schema, FAQs, internal links, and section expansion
- require approval before publish

### Phase 3

- build an execution layer with CMS writebacks and experiment tracking
- score which response types recover rankings fastest by niche and query class
- add billing, multi-tenant projects, team workflows, and alerting

## Suggested SaaS architecture

- `collector` service for SERP snapshots
- `snapshot` service for HTML fetch, parse, and feature extraction
- `detector` service for outrank events and page change scoring
- `planner` service for response recommendations
- `executor` service for guarded draft creation and optional CMS publishing
- `app` for projects, alerts, review queues, billing, and notification channels like Telegram

## Current storage model

- `data/projects/<slug>/project.json`: tracked project config
- `data/projects/<slug>/runs/<timestamp>.json`: one normalized collection run

Each run stores:

- keyword results by query and location
- collected page snapshots for the tracked URLs
- provider name and collection timestamp

## Provider contract

Provider objects implement:

- `collectKeyword({ keyword, location, device })`
- `getPageSnapshot(url)`

The included `http-json` provider expects a POST endpoint that returns:

```json
{
  "results": [
    {
      "position": 1,
      "domain": "example.com",
      "url": "https://example.com/page",
      "title": "Result title"
    }
  ]
}
```

## Serper notes

The built-in `serper` provider calls `https://google.serper.dev/search` and expects the API key in `LIVING_SEO_SERPER_API_KEY`.

Based on Serper's official site, it provides real-time Google results, location customization, and a free starter allowance before paid credits.

- Homepage and pricing: [Serper](https://serper.dev/)
