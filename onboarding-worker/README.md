# Asana Onboarding Worker

This Cloudflare Worker accepts the current onboarding form payload at `/api/submit` and:

1. duplicates either an existing Asana project or task template
2. renames the duplicate to the submitted `businessName`
3. optionally moves a duplicated task into a configured project section
4. optionally sets Asana custom fields from the onboarding payload in task mode

## What You Still Need

- a valid Asana PAT with access to the target project and template task
- the template project GID if you want the whole board duplicated for each business
- the template task GID if you want only one task duplicated for each business
- optional section GID if new tasks should always land in one section
- optional custom field IDs if you want onboarding values written into project fields

## Setup

1. Copy `wrangler.toml.example` to `wrangler.toml`
2. Choose `ASANA_DUPLICATE_MODE`:

```toml
ASANA_DUPLICATE_MODE = "project"
```

or:

```toml
ASANA_DUPLICATE_MODE = "task"
```

3. Fill in the matching template ID
3. Set your token:

```bash
wrangler secret put ASANA_PAT
```

4. Run locally:

```bash
npm install
npm run dev
```

Local test page:

```text
http://127.0.0.1:8787/test
```

Live workers.dev route:

```text
https://onboarding.sharkbrandingsolutions2.workers.dev/onboarding
```

5. Deploy:

```bash
npm run deploy
```

## Project Mode

If you want the entire Asana board duplicated per business, use:

```toml
ASANA_DUPLICATE_MODE = "project"
ASANA_TEMPLATE_PROJECT_GID = "1213638268637823"
ASANA_DUPLICATE_INCLUDE = "task_subtasks,task_attachments,task_notes,task_assignee,task_dates,task_dependencies,task_followers,task_projects,task_tags,members,notes,forms,rules"
```

In this mode, the worker duplicates the source project and renames the new project to the submitted business name.

## Task Mode

If you want a single template task duplicated into an existing board, use:

```toml
ASANA_DUPLICATE_MODE = "task"
ASANA_TEMPLATE_TASK_GID = "..."
ASANA_PROJECT_GID = "1213638268637823"
ASANA_SECTION_GID = "..."
```

## Custom Field Mapping

`ASANA_CUSTOM_FIELD_MAP` is a JSON object keyed by onboarding payload field name.

Simple text field example:

```json
{
  "websiteUrl": "120000000000001",
  "marketingGoals": "120000000000002"
}
```

Enum field example:

```json
{
  "gbpAccess": {
    "gid": "120000000000003",
    "type": "enum",
    "options": {
      "Yes": "120000000000101",
      "No": "120000000000102",
      "Not Sure": "120000000000103"
    }
  }
}
```

## Notes

- The duplicate endpoint is asynchronous, so the worker polls the Asana job until the copied resource is available.
- The form payload stays unchanged, so the existing frontend can continue to `POST /api/submit`.
- The worker serves the onboarding UI at `/onboarding` on the `workers.dev` URL and also supports `/test` for local checks.
