# Living SEO Telegram Commands

This file explains how to use the `Living SEO` Telegram bot for project management, keyword management, and ranking lookups.

## What The Bot Actually Checks

The bot does **not** scan all of Google for everything a domain ranks for.

It checks a domain against the keyword set stored in a Living SEO project.

That means:

- if a keyword is in the project, the bot can check it
- if a keyword is not in the project, the bot cannot report on it yet

## Core Idea

Each Telegram chat can have one active project.

Once a project is selected, most commands use that project by default.

Example active project:

```text
shark-branding-solutions
```

## Project Commands

### `/project list`

Shows all available project slugs.

Example:

```text
/project list
```

### `/project use project-slug`

Sets the active project for your Telegram chat.

Example:

```text
/project use shark-branding-solutions
```

### `/project current`

Shows the project currently active for your chat.

Example:

```text
/project current
```

## Keyword Commands

These are the `/keys`-style commands you asked about. In the bot, the command prefix is `/keywords`.

### `/keywords add "keyword" "location"`

Adds a keyword to the current active project.

Example:

```text
/project use shark-branding-solutions
/keywords add "ai visibility consultant st petersburg" "St. Petersburg, FL"
```

### `/keywords add project-slug "keyword" "location"`

Adds a keyword to a specific project without changing the active project.

Example:

```text
/keywords add shark-branding-solutions-wesley-chapel "answer engine optimization wesley chapel" "Wesley Chapel, FL"
```

### Keyword format rules

- Put the keyword in quotes
- Put the location in quotes
- Use the city or region exactly how you want it tracked
- Current default device is `desktop`

Correct:

```text
/keywords add "google business profile optimization tampa" "Tampa, FL"
```

Incorrect:

```text
/keywords add google business profile optimization tampa Tampa, FL
```

## Ranking Commands

### `/top1 domain.com`

Returns keywords where the domain is currently ranking `#1` in the active project.

Example:

```text
/top1 sharkbrandingsolutions.com
```

### `/top3 domain.com`

Returns keywords where the domain is currently ranking in the top 3.

Example:

```text
/top3 sharkbrandingsolutions.com
```

### `/wins domain.com`

Returns the tracked ranking wins for that domain with positions.

Example:

```text
/wins sharkbrandingsolutions.com
```

### `/compare domain1.com domain2.com`

Compares two domains inside the active project keyword set.

Example:

```text
/compare sharkbrandingsolutions.com competitor.com
```

## Typical Workflow

### 1. Pick a project

```text
/project use shark-branding-solutions
```

### 2. Add a new keyword

```text
/keywords add "ai visibility seo st petersburg" "St. Petersburg, FL"
```

### 3. Check what you rank `#1` for

```text
/top1 sharkbrandingsolutions.com
```

### 4. Check broader wins

```text
/wins sharkbrandingsolutions.com
```

### 5. Compare against a competitor

```text
/compare sharkbrandingsolutions.com competitor.com
```

## Important Limits

- The bot only knows what is in the project keyword list
- More keywords means more API usage
- Command replies depend on the Telegram poller automation running
- Results are based on the configured project location settings

## Current Projects

At the time this file was created, the repo includes:

- `shark-branding-solutions`
- `shark-branding-solutions-wesley-chapel`

## Good Usage Pattern

Use the general project for broad tracking:

- national AI visibility terms
- Tampa Bay terms
- general service terms

Use city-specific projects for tighter local monitoring:

- Wesley Chapel
- Tampa
- St. Petersburg
- Lutz

## If A Command Does Nothing

Check these in order:

1. The Telegram poller automation is active
2. The chat has an active project set
3. The domain is typed correctly
4. The keyword exists in the tracked project
5. The Serper API key is still valid
