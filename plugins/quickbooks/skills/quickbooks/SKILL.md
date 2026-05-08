---
name: quickbooks
description: Use when the user wants to read or update QuickBooks data such as customers, invoices, payments, expenses, cash flow, or reconciliation tasks through this plugin's connector or MCP server.
---

# QuickBooks

Use this skill when the request is about QuickBooks workflows.

## Intended uses

- Find customers, invoices, estimates, expenses, payments, or account activity.
- Summarize accounting status, overdue receivables, or cash flow trends.
- Draft operational actions such as invoice follow-up, reconciliation notes, or bookkeeping checklists.

## Workflow

1. Prefer the QuickBooks app connection if `.app.json` contains a real installed app id.
2. Otherwise use the MCP server configured in `.mcp.json` if the server command and credentials are set.
3. If neither integration is configured, explain the missing piece briefly and continue with planning, data-shaping, or implementation work that does not require live QuickBooks access.

## Guardrails

- Never paste or store raw API keys, OAuth secrets, access tokens, or refresh tokens in repo files.
- Reference environment variables for secrets.
- Confirm before making write actions that create or modify financial records when the request is ambiguous.
