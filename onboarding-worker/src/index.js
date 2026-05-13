const DEFAULT_INCLUDE = [
  'task_subtasks',
  'task_attachments',
  'task_notes',
  'task_assignee',
  'task_dates',
  'task_dependencies',
  'task_followers',
  'task_projects',
  'task_tags',
  'members',
  'notes',
  'forms',
  'rules',
];

const FIELD_ORDER = [
  'businessName',
  'websiteUrl',
  'businessPhone',
  'businessAddress',
  'businessDesc',
  'contactName',
  'contactEmail',
  'contactPhone',
  'team1Name',
  'team1Email',
  'team1Role',
  'team2Name',
  'team2Email',
  'team2Role',
  'googleEmail',
  'gbpAccess',
  'gbpLink',
  'gaId',
  'searchConsoleEmail',
  'facebookUrl',
  'instagramUrl',
  'linkedinUrl',
  'tiktokUrl',
  'youtubeUrl',
  'runningAds',
  'googleAdsId',
  'metaAdsId',
  'websitePlatform',
  'gtmInstalled',
  'gtmContainerId',
  'gtmAccessEmail',
  'bizCategory',
  'bizHours',
  'serviceAreas',
  'logoLink',
  'brandImages',
  'referralSource',
  'marketingGoals',
];

const FIELD_LABELS = {
  businessName: 'Business name',
  websiteUrl: 'Website URL',
  businessPhone: 'Business phone',
  businessAddress: 'Business address',
  businessDesc: 'Business description',
  contactName: 'Primary contact name',
  contactEmail: 'Primary contact email',
  contactPhone: 'Primary contact phone',
  team1Name: 'Team contact 1 name',
  team1Email: 'Team contact 1 email',
  team1Role: 'Team contact 1 role',
  team2Name: 'Team contact 2 name',
  team2Email: 'Team contact 2 email',
  team2Role: 'Team contact 2 role',
  googleEmail: 'Google account email',
  gbpAccess: 'GBP access',
  gbpLink: 'GBP link',
  gaId: 'Google Analytics ID',
  searchConsoleEmail: 'Search Console email',
  facebookUrl: 'Facebook URL',
  instagramUrl: 'Instagram URL',
  linkedinUrl: 'LinkedIn URL',
  tiktokUrl: 'TikTok URL',
  youtubeUrl: 'YouTube URL',
  runningAds: 'Running ads',
  googleAdsId: 'Google Ads ID',
  metaAdsId: 'Meta Ads ID',
  websitePlatform: 'Website platform',
  gtmInstalled: 'GTM installed',
  gtmContainerId: 'GTM container ID',
  gtmAccessEmail: 'GTM access email',
  bizCategory: 'Business category',
  bizHours: 'Business hours',
  serviceAreas: 'Service areas',
  logoLink: 'Logo link',
  brandImages: 'Brand images',
  referralSource: 'Referral source',
  marketingGoals: 'Marketing goals',
};

const STEP_GROUPS = [
  {
    id: 'business',
    title: 'Business Basics',
    subtitle: "We'll start with the details your team will reference throughout onboarding.",
    eta: 'Estimated time: 2 min',
    fields: ['businessName', 'websiteUrl', 'businessPhone', 'businessAddress', 'businessDesc'],
  },
  {
    id: 'contacts',
    title: 'Contacts & Team',
    subtitle: 'Tell us who we should coordinate with during setup.',
    fields: ['contactName', 'contactEmail', 'contactPhone', 'team1Name', 'team1Email', 'team1Role', 'team2Name', 'team2Email', 'team2Role'],
  },
  {
    id: 'google',
    title: 'Google Setup',
    subtitle: 'Share the Google accounts and access details tied to your business.',
    fields: ['gbpAccess', 'googleEmail', 'gbpLink', 'gaId', 'searchConsoleEmail'],
  },
  {
    id: 'social',
    title: 'Social Profiles',
    subtitle: 'Add any active social accounts you want us to reference.',
    fields: ['facebookUrl', 'instagramUrl', 'linkedinUrl', 'tiktokUrl', 'youtubeUrl'],
  },
  {
    id: 'ads',
    title: 'Advertising',
    subtitle: 'Tell us whether paid campaigns are already running.',
    fields: ['runningAds', 'googleAdsId', 'metaAdsId'],
  },
  {
    id: 'website',
    title: 'Website & Tracking',
    subtitle: 'Help us understand how your site is built and tracked today.',
    fields: ['websitePlatform', 'gtmInstalled', 'gtmContainerId', 'gtmAccessEmail'],
  },
  {
    id: 'details',
    title: 'Business Details & Assets',
    subtitle: 'Finish with the operational details and files our team will need.',
    fields: ['bizCategory', 'bizHours', 'serviceAreas', 'logoLink', 'brandImages', 'referralSource', 'marketingGoals'],
  },
  {
    id: 'review',
    title: 'Review & Submit',
    subtitle: "One final check and we'll take it from here.",
    fields: [],
  },
];

const SUBTASK_GROUPS = [
  {
    name: 'Business Details',
    fields: ['websiteUrl', 'businessPhone', 'businessAddress', 'businessDesc', 'bizCategory', 'bizHours', 'serviceAreas'],
  },
  {
    name: 'Contacts',
    fields: ['contactName', 'contactEmail', 'contactPhone', 'team1Name', 'team1Email', 'team1Role', 'team2Name', 'team2Email', 'team2Role'],
  },
  {
    name: 'Google And Tracking',
    fields: ['googleEmail', 'gbpAccess', 'gbpLink', 'gaId', 'searchConsoleEmail', 'websitePlatform', 'gtmInstalled', 'gtmContainerId', 'gtmAccessEmail'],
  },
  {
    name: 'Social And Paid',
    fields: ['facebookUrl', 'instagramUrl', 'linkedinUrl', 'tiktokUrl', 'youtubeUrl', 'runningAds', 'googleAdsId', 'metaAdsId'],
  },
  {
    name: 'Brand And Goals',
    fields: ['logoLink', 'brandImages', 'referralSource', 'marketingGoals'],
  },
];

const TEST_PAYLOAD = {
  businessName: `Test Business ${new Date().toISOString().replace(/[:.]/g, '-')}`,
  websiteUrl: 'https://example-test-client.com',
  businessPhone: '(813) 555-0142',
  businessAddress: '123 Test Avenue, Tampa, FL 33602',
  businessDesc: 'Test onboarding submission for validating Asana project duplication from the onboarding worker.',
  contactName: 'Test Contact',
  contactEmail: 'test.contact@example.com',
  contactPhone: '(813) 555-0174',
  team1Name: 'Operations Contact',
  team1Email: 'ops@example.com',
  team1Role: 'Operations Manager',
  team2Name: 'Marketing Contact',
  team2Email: 'marketing@example.com',
  team2Role: 'Marketing Lead',
  googleEmail: 'test.google@example.com',
  gbpAccess: 'Yes',
  gbpLink: 'https://maps.google.com/?cid=1234567890',
  gaId: 'G-TEST12345',
  searchConsoleEmail: 'searchconsole@example.com',
  facebookUrl: 'https://facebook.com/exampletestclient',
  instagramUrl: 'https://instagram.com/exampletestclient',
  linkedinUrl: 'https://linkedin.com/company/exampletestclient',
  tiktokUrl: 'https://tiktok.com/@exampletestclient',
  youtubeUrl: 'https://youtube.com/@exampletestclient',
  runningAds: 'No',
  googleAdsId: '',
  metaAdsId: '',
  websitePlatform: 'WordPress',
  gtmInstalled: 'Not Sure',
  gtmContainerId: '',
  gtmAccessEmail: '',
  bizCategory: 'Marketing Consultant',
  bizHours: 'Mon-Fri 9am-5pm',
  serviceAreas: 'Tampa, St. Petersburg, Clearwater',
  logoLink: 'https://drive.google.com/example-logo',
  brandImages: 'https://drive.google.com/example-brand-images',
  referralSource: 'Internal automation test',
  marketingGoals: 'Validate the onboarding automation, duplicate the Asana board, and confirm the new project is named correctly.',
};

const LOGO_URL = 'https://sharkbrandingsolutions.com/logo.png';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/onboarding' || url.pathname === '/test')) {
      const isTestMode =
        url.pathname === '/test' ||
        url.searchParams.has('test') ||
        url.href.endsWith('=test');
      return htmlResponse(renderApp(isTestMode));
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return jsonResponse({
        ok: true,
        mode: env.ASANA_DUPLICATE_MODE || 'project',
        hasPat: Boolean(env.ASANA_PAT),
        templateProject: env.ASANA_TEMPLATE_PROJECT_GID || null,
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/submit') {
      try {
        const payload = sanitizePayload(await request.json());
        validatePayload(payload);

        if (!env.ASANA_PAT) {
          return jsonResponse({ ok: false, error: 'ASANA_PAT is not configured.' }, 500);
        }

        const result = await submitToAsana(payload, env);
        return jsonResponse({
          ok: true,
          businessName: payload.businessName,
          ...result,
        });
      } catch (error) {
        return jsonResponse(
          {
            ok: false,
            error: error instanceof Error ? error.message : 'Submission failed.',
          },
          500,
        );
      }
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    return new Response('Not found', { status: 404 });
  },
};

async function submitToAsana(payload, env) {
  const mode = (env.ASANA_DUPLICATE_MODE || 'project').trim();
  let projectGid = env.ASANA_PROJECT_GID || null;
  let projectUrl = null;

  if (mode === 'project') {
    if (!env.ASANA_TEMPLATE_PROJECT_GID) {
      throw new Error('ASANA_TEMPLATE_PROJECT_GID is not configured.');
    }

    const include = (env.ASANA_DUPLICATE_INCLUDE || DEFAULT_INCLUDE.join(','))
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const duplicateJob = await asanaRequest(`/projects/${env.ASANA_TEMPLATE_PROJECT_GID}/duplicate`, env, {
      method: 'POST',
      body: {
        data: {
          name: payload.businessName,
          include,
        },
      },
    });

    const jobResult = await pollJob(duplicateJob.data.gid, env);
    projectGid = jobResult.new_project_gid || jobResult.new_project?.gid || extractProjectGid(jobResult);

    if (!projectGid) {
      throw new Error('Project duplication completed, but the new project could not be identified.');
    }

    projectUrl = `https://app.asana.com/0/${projectGid}/list`;
  }

  if (!projectGid) {
    throw new Error('No target Asana project was available for intake task creation.');
  }

  const firstSection = await getFirstSection(projectGid, env);
  const projectFieldSettings = await getProjectCustomFieldSettings(projectGid, env);
  const customFields = mapCustomFields(payload, parseCustomFieldMap(env.ASANA_CUSTOM_FIELD_MAP), projectFieldSettings);
  const intakeTaskName = 'Onboarding submission';

  const taskResponse = await asanaRequest('/tasks', env, {
    method: 'POST',
    body: {
      data: {
        name: intakeTaskName,
        notes: buildPlainNotes(payload),
        projects: [projectGid],
        ...(Object.keys(customFields).length ? { custom_fields: customFields } : {}),
      },
    },
  });

  const taskGid = taskResponse.data.gid;

  if (firstSection?.gid) {
    await asanaRequest(`/tasks/${taskGid}/addProject`, env, {
      method: 'POST',
      body: {
        data: {
          project: projectGid,
          section: firstSection.gid,
        },
      },
    });
  }

  for (const group of SUBTASK_GROUPS) {
    const note = formatFieldList(group.fields, payload);
    if (!note) {
      continue;
    }

    await asanaRequest(`/tasks/${taskGid}/subtasks`, env, {
      method: 'POST',
      body: {
        data: {
          name: `${payload.businessName} ${group.name}`,
          notes: note,
        },
      },
    });
  }

  return {
    projectGid,
    projectUrl,
    taskGid,
    taskUrl: `https://app.asana.com/0/${taskGid}`,
  };
}

async function pollJob(jobGid, env) {
  const attempts = 12;

  for (let index = 0; index < attempts; index += 1) {
    const response = await asanaRequest(`/jobs/${jobGid}`, env);
    const job = response.data;

    if (job.resource_subtype === 'duplicate_project' && job.new_project?.gid) {
      return job;
    }

    if (job.status === 'succeeded') {
      return job;
    }

    if (job.status === 'failed') {
      throw new Error(job.errors?.[0]?.message || 'Asana duplicate job failed.');
    }

    await delay(1500);
  }

  throw new Error('Timed out waiting for Asana duplicate job.');
}

async function getFirstSection(projectGid, env) {
  try {
    const response = await asanaRequest(`/projects/${projectGid}/sections`, env);
    return response.data?.[0] || null;
  } catch {
    return null;
  }
}

async function getProjectCustomFieldSettings(projectGid, env) {
  try {
    const response = await asanaRequest(
      `/projects/${projectGid}/custom_field_settings?opt_expand=custom_field,custom_field.enum_options`,
      env,
    );
    return response.data || [];
  } catch {
    return [];
  }
}

function sanitizePayload(raw) {
  const payload = {};

  for (const key of FIELD_ORDER) {
    const value = raw?.[key];
    payload[key] = typeof value === 'string' ? value.trim() : '';
  }

  return payload;
}

function validatePayload(payload) {
  if (!payload.businessName) {
    throw new Error('Business name is required.');
  }

  if (!payload.contactName) {
    throw new Error('Primary contact name is required.');
  }

  if (!payload.contactEmail || !payload.contactEmail.includes('@')) {
    throw new Error('A valid primary contact email is required.');
  }
}

function parseCustomFieldMap(raw) {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function mapCustomFields(payload, fieldMap, projectFieldSettings = []) {
  const mapped = {};

  for (const [key, config] of Object.entries(fieldMap)) {
    const value = payload[key];
    if (!value) {
      continue;
    }

    if (typeof config === 'string') {
      mapped[config] = value;
      continue;
    }

    if (config?.type === 'enum' && config.gid && config.options?.[value]) {
      mapped[config.gid] = config.options[value];
      continue;
    }

    if (config?.gid) {
      mapped[config.gid] = value;
    }
  }

  const autoDefinitions = buildAutomaticFieldDefinitions(projectFieldSettings);
  for (const definition of autoDefinitions) {
    const value = payload[definition.payloadKey];
    if (!value) {
      continue;
    }

    const mappedValue = convertCustomFieldValue(value, definition);
    if (mappedValue === undefined) {
      continue;
    }

    mapped[definition.gid] = mappedValue;
  }

  return mapped;
}

function buildPlainNotes(payload) {
  return `Submission captured from the Shark Branding onboarding portal for ${payload.businessName}.`;
}

function formatFieldList(fields, payload) {
  return fields
    .map((key) => {
      const value = payload[key];
      if (!value) {
        return '';
      }

      return `${FIELD_LABELS[key] || key}: ${value}`;
    })
    .filter(Boolean)
    .join('\n');
}

function extractProjectGid(job) {
  if (job.new_project_gid) {
    return job.new_project_gid;
  }

  if (job.new_project?.gid) {
    return job.new_project.gid;
  }

  if (job.result?.new_project?.gid) {
    return job.result.new_project.gid;
  }

  return null;
}

function buildAutomaticFieldDefinitions(projectFieldSettings) {
  const byName = new Map();

  for (const setting of projectFieldSettings) {
    const field = setting.custom_field;
    if (!field?.name || !field?.gid) {
      continue;
    }

    const normalizedName = normalizeFieldName(field.name);
    if (!byName.has(normalizedName)) {
      byName.set(normalizedName, []);
    }
    byName.get(normalizedName).push(field);
  }

  const mappings = [
    { payloadKey: 'contactName', fieldName: 'Primary Contact' },
    { payloadKey: 'contactPhone', fieldName: 'Phone Number' },
    { payloadKey: 'websiteUrl', fieldName: 'Website URL' },
    { payloadKey: 'businessAddress', fieldName: 'Business Address' },
    { payloadKey: 'bizCategory', fieldName: 'Industry' },
    { payloadKey: 'gbpAccess', fieldName: 'Has GBP?' },
    { payloadKey: 'gbpLink', fieldName: 'GBP Link' },
    { payloadKey: 'facebookUrl', fieldName: 'Facebook URL' },
    { payloadKey: 'instagramUrl', fieldName: 'Instagram URL' },
    { payloadKey: 'runningAds', fieldName: 'Currently Runs Ads?' },
    { payloadKey: 'googleAdsId', fieldName: 'Google Ads ID' },
    { payloadKey: 'metaAdsId', fieldName: 'Meta Ads ID' },
    { payloadKey: 'marketingGoals', fieldName: 'Marketing Goals' },
    { payloadKey: 'websitePlatform', fieldName: 'Website Platform', preferredSubtype: 'text' },
    { payloadKey: 'websitePlatform', fieldName: 'Website Platform', preferredSubtype: 'multi_enum' },
    { payloadKey: 'gtmInstalled', fieldName: 'GTM Installed?' },
    { payloadKey: 'gtmInstalled', fieldName: 'Google Tag Manager', preferredSubtype: 'multi_enum' },
    { payloadKey: 'referralSource', fieldName: 'Lead Source' },
  ];

  return mappings
    .map((mapping) => {
      const candidates = byName.get(normalizeFieldName(mapping.fieldName)) || [];
      const field = mapping.preferredSubtype
        ? candidates.find((candidate) => candidate.resource_subtype === mapping.preferredSubtype)
        : candidates[0];

      if (!field) {
        return null;
      }

      return {
        payloadKey: mapping.payloadKey,
        gid: field.gid,
        type: field.resource_subtype,
        options: field.enum_options || [],
      };
    })
    .filter(Boolean);
}

function convertCustomFieldValue(value, definition) {
  if (definition.type === 'text') {
    return String(value);
  }

  if (definition.type === 'number') {
    const numericValue = Number(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }

  if (definition.type === 'enum') {
    const option = definition.options.find((candidate) => normalizeFieldName(candidate.name) === normalizeFieldName(String(value)));
    return option?.gid;
  }

  if (definition.type === 'multi_enum') {
    const matched = definition.options
      .filter((candidate) => {
        const normalizedCandidate = normalizeFieldName(candidate.name);
        const normalizedValue = normalizeFieldName(String(value));
        return (
          normalizedCandidate === normalizedValue ||
          normalizedCandidate.includes(normalizedValue) ||
          normalizedValue.includes(normalizedCandidate)
        );
      })
      .map((candidate) => candidate.gid);

    return matched.length ? matched : undefined;
  }

  return undefined;
}

function normalizeFieldName(value) {
  return String(value).trim().toLowerCase();
}

async function asanaRequest(path, env, options = {}) {
  const response = await fetch(`https://app.asana.com/api/1.0${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${env.ASANA_PAT}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await response.json();

  if (!response.ok) {
    const message = json?.errors?.[0]?.message || `Asana request failed with ${response.status}.`;
    throw new Error(message);
  }

  return json;
}

function renderApp(isTestMode) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shark Branding Solutions - Onboarding Intake</title>
    <style>
      :root {
        --bg: #f4f7fb;
        --surface: #ffffff;
        --text: #16202c;
        --muted: #66748a;
        --line: #d8e0ea;
        --accent: #2463eb;
        --accent-dark: #1d4fd7;
        --success: #0f766e;
        --danger: #b91c1c;
        --shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        --radius: 22px;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        background: linear-gradient(180deg, #eef3f9 0%, var(--bg) 100%);
        color: var(--text);
      }
      .shell {
        width: min(900px, calc(100% - 24px));
        margin: 0 auto;
        padding: 24px 0 48px;
      }
      .panel {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      .hero {
        padding: 28px;
        margin-bottom: 16px;
      }
      .hero h1 {
        margin: 0 0 10px;
        font-size: clamp(1.9rem, 3vw, 2.8rem);
      }
      .hero p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }
      .form-card {
        padding: 28px;
      }
      .meta {
        color: var(--muted);
        font-size: 0.95rem;
        margin-bottom: 8px;
      }
      .title {
        margin: 0 0 8px;
        font-size: clamp(1.45rem, 2.5vw, 2.15rem);
      }
      .subtitle {
        margin: 0 0 24px;
        color: var(--muted);
        line-height: 1.6;
      }
      .progress {
        margin-bottom: 24px;
      }
      .progress-bar {
        height: 10px;
        border-radius: 999px;
        background: #e8eef6;
        overflow: hidden;
      }
      .progress-bar span {
        display: block;
        height: 100%;
        width: 0;
        background: linear-gradient(90deg, #2463eb, #3b82f6);
        transition: width 180ms ease;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .field {
        display: grid;
        gap: 8px;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      label {
        font-size: 0.94rem;
        font-weight: 700;
      }
      .req::after {
        content: "*";
        color: var(--danger);
        margin-left: 2px;
      }
      input, textarea, select {
        width: 100%;
        padding: 14px 15px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: #fff;
        color: var(--text);
        font: inherit;
      }
      textarea {
        min-height: 128px;
        resize: vertical;
      }
      input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: #91b2ff;
        box-shadow: 0 0 0 4px rgba(36, 99, 235, 0.12);
      }
      .toggle {
        margin-top: 22px;
        padding: 16px 18px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: #f8fbff;
      }
      .toggle button {
        background: transparent;
        border: 0;
        padding: 0;
        color: var(--accent);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      .toggle p {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 0.92rem;
      }
      .optional {
        margin-top: 16px;
        display: none;
      }
      .optional.open {
        display: block;
      }
      .review {
        display: grid;
        gap: 16px;
      }
      .review-card {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 18px;
      }
      .review-card h3 {
        margin: 0 0 12px;
        font-size: 1rem;
      }
      .review-item {
        padding: 8px 0;
        border-top: 1px solid #edf2f7;
      }
      .review-item:first-child {
        border-top: 0;
        padding-top: 0;
      }
      .review-item strong {
        display: block;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--muted);
        margin-bottom: 4px;
      }
      .confirm {
        margin-top: 18px;
        padding: 16px 18px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: #f8fbff;
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .confirm input {
        width: 18px;
        height: 18px;
        margin-top: 3px;
      }
      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-top: 24px;
        flex-wrap: wrap;
      }
      .buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .working {
        display: none;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: #f8fbff;
        color: var(--muted);
        font-weight: 600;
      }
      .working.visible {
        display: inline-flex;
      }
      .spinner {
        width: 20px;
        height: 20px;
        border-radius: 999px;
        border: 2.5px solid #c8d5ea;
        border-top-color: var(--accent);
        animation: spin 0.85s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      button.action {
        border: 0;
        border-radius: 999px;
        padding: 13px 18px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      .primary {
        background: var(--accent);
        color: white;
      }
      .primary:hover {
        background: var(--accent-dark);
      }
      .secondary {
        background: #e9eef6;
        color: var(--text);
      }
      .ghost {
        background: #fff4e8;
        color: #b45309;
      }
      .status {
        min-height: 22px;
        color: var(--muted);
      }
      .status.error { color: var(--danger); }
      .status.success { color: var(--success); }
      .links {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 14px;
      }
      .links a {
        color: var(--accent);
        text-decoration: none;
        font-weight: 700;
      }
      .thanks-screen {
        text-align: center;
        padding: 24px 8px 8px;
      }
      .thanks-logo {
        display: inline-flex;
        justify-content: center;
        margin-bottom: 18px;
      }
      .thanks-logo img {
        max-width: 260px;
        width: 100%;
        height: auto;
      }
      .thanks-screen h2 {
        margin: 0 0 12px;
        font-size: clamp(1.8rem, 3vw, 2.4rem);
      }
      .thanks-screen p {
        margin: 0 auto 10px;
        max-width: 38rem;
        color: var(--muted);
        line-height: 1.7;
      }
      .thanks-card {
        margin-top: 20px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: #f8fbff;
      }
      .hidden {
        display: none;
      }
      @media (max-width: 720px) {
        .grid { grid-template-columns: 1fr; }
        .hero, .form-card { padding: 22px; }
        .actions { align-items: flex-start; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="panel hero">
        <h1>Onboarding Intake Portal</h1>
        <p>Complete the onboarding form below and we will create your Asana onboarding workspace behind the scenes. The project name will use your business name.</p>
      </section>
      <section class="panel form-card">
        <div class="progress">
          <div class="meta" id="stepMeta">Step 1 of ${STEP_GROUPS.length}</div>
          <div class="progress-bar"><span id="progressBar"></span></div>
        </div>
        <div id="stepRoot"></div>
        <div class="actions">
          <div>
            <div class="status" id="status"></div>
            <div class="links" id="successLinks"></div>
          </div>
          <div class="buttons">
            ${isTestMode ? '<button class="action ghost" type="button" id="fillTest">Fill Test Data</button>' : ''}
            <button class="action secondary" type="button" id="backBtn">← Back</button>
            <button class="action primary" type="button" id="nextBtn">Continue →</button>
          </div>
          <div class="working" id="workingState" aria-live="polite">
            <span class="spinner" aria-hidden="true"></span>
            <span>Submitting your onboarding. Please keep this page open.</span>
          </div>
        </div>
      </section>
    </main>
    <script>
      const STEP_GROUPS = ${JSON.stringify(STEP_GROUPS)};
      const TEST_PAYLOAD = ${JSON.stringify(TEST_PAYLOAD)};
      const FIELD_LABELS = ${JSON.stringify(FIELD_LABELS)};
      const DRAFT_KEY = 'shark-onboarding-draft-v3';
      const root = document.getElementById('stepRoot');
      const statusEl = document.getElementById('status');
      const linksEl = document.getElementById('successLinks');
      const stepMeta = document.getElementById('stepMeta');
      const progressBar = document.getElementById('progressBar');
      const backBtn = document.getElementById('backBtn');
      const nextBtn = document.getElementById('nextBtn');
      const fillTestBtn = document.getElementById('fillTest');
      const workingState = document.getElementById('workingState');
      const buttonRow = document.querySelector('.buttons');
      let currentStep = 0;
      let submitting = false;
      let completed = false;

      const schema = {
        businessName: { label: 'Business Name', required: true },
        websiteUrl: { label: 'Website URL', required: true, type: 'url' },
        businessPhone: { label: 'Business Phone', required: true, type: 'tel' },
        businessAddress: { label: 'Business Address', required: true, full: true },
        businessDesc: { label: 'Business Description', required: true, type: 'textarea', full: true },
        contactName: { label: 'Full Name', required: true },
        contactEmail: { label: 'Email', required: true, type: 'email' },
        contactPhone: { label: 'Phone', required: true, type: 'tel' },
        team1Name: { label: 'Name' },
        team1Email: { label: 'Email', type: 'email' },
        team1Role: { label: 'Role' },
        team2Name: { label: 'Name' },
        team2Email: { label: 'Email', type: 'email' },
        team2Role: { label: 'Role' },
        gbpAccess: { label: 'GBP Access', required: true, type: 'select', options: ['', 'Yes', 'No', 'Not Sure'] },
        googleEmail: { label: 'Primary Google Email', required: true, type: 'email' },
        gbpLink: { label: 'Google Business Profile Link', full: true },
        gaId: { label: 'Google Analytics ID' },
        searchConsoleEmail: { label: 'Search Console Email', type: 'email' },
        facebookUrl: { label: 'Facebook URL', full: true },
        instagramUrl: { label: 'Instagram URL', full: true },
        linkedinUrl: { label: 'LinkedIn URL', full: true },
        tiktokUrl: { label: 'TikTok URL', full: true },
        youtubeUrl: { label: 'YouTube URL', full: true },
        runningAds: { label: 'Currently Running Ads?', required: true, type: 'select', options: ['', 'Google', 'Meta', 'Both', 'No'] },
        googleAdsId: { label: 'Google Ads ID' },
        metaAdsId: { label: 'Meta Ads ID' },
        websitePlatform: { label: 'Website Platform', required: true, type: 'select', options: ['', 'WordPress', 'Wix', 'Shopify', 'Other'] },
        gtmInstalled: { label: 'GTM Installed?', required: true, type: 'select', options: ['', 'Yes', 'No', 'Not Sure'] },
        gtmContainerId: { label: 'GTM Container ID' },
        gtmAccessEmail: { label: 'GTM Access Email', type: 'email' },
        bizCategory: { label: 'Primary Business Category', required: true },
        bizHours: { label: 'Business Hours', required: true },
        serviceAreas: { label: 'Service Areas', required: true, full: true },
        logoLink: { label: 'Logo (Drive / Dropbox link)', full: true },
        brandImages: { label: 'Brand Images (Drive / Dropbox link)', full: true },
        referralSource: { label: 'Referral Source' },
        marketingGoals: { label: 'Main Marketing Goals', required: true, type: 'textarea', full: true },
      };

      const optionalConfig = {
        contacts: {
          toggleLabel: 'Add more team contacts',
          helper: 'Only include extra contacts if they need to be part of setup or approvals.',
          groups: [
            { title: 'Additional Contact 1 (Optional)', fields: ['team1Name', 'team1Email', 'team1Role'] },
            { title: 'Additional Contact 2 (Optional)', fields: ['team2Name', 'team2Email', 'team2Role'] },
          ],
        },
        google: {
          toggleLabel: 'Add optional Google details',
          helper: 'Include these if you already have them handy. You can skip and send them later if needed.',
          groups: [{ title: 'Optional Google Details', fields: ['gbpLink', 'gaId', 'searchConsoleEmail'] }],
        },
        social: {
          toggleLabel: 'Add social profile links',
          helper: 'Only open this if there are live channels our team should reference.',
          groups: [{ title: 'Social Profiles', fields: ['facebookUrl', 'instagramUrl', 'linkedinUrl', 'tiktokUrl', 'youtubeUrl'] }],
        },
        details: {
          toggleLabel: 'Add logos, image links, or referral notes',
          helper: 'Helpful if you already have them. If not, your team can share them later.',
          groups: [{ title: 'Optional Assets', fields: ['logoLink', 'brandImages', 'referralSource'] }],
        },
      };

      const reviewGroups = STEP_GROUPS.filter((step) => step.id !== 'review');
      const formData = loadDraft();
      if (typeof formData.confirmAccurate !== 'boolean') {
        formData.confirmAccurate = false;
      }

      renderStep();
      updateProgress();

      backBtn.addEventListener('click', () => {
        if (submitting || currentStep === 0) return;
        currentStep -= 1;
        renderStep();
        updateProgress();
      });

      nextBtn.addEventListener('click', async () => {
        if (submitting) return;

        if (currentStep < STEP_GROUPS.length - 1) {
          const error = validateStep(currentStep);
          if (error) {
            setStatus(error, 'error');
            return;
          }
          setStatus('', '');
          currentStep += 1;
          renderStep();
          updateProgress();
          return;
        }

        const error = validateAll();
        if (error) {
          setStatus(error, 'error');
          return;
        }
        if (!formData.confirmAccurate) {
          setStatus('Please confirm the information is accurate before submitting.', 'error');
          return;
        }

        submitting = true;
        nextBtn.disabled = true;
        backBtn.disabled = true;
        if (fillTestBtn) fillTestBtn.disabled = true;
        if (buttonRow) buttonRow.classList.add('hidden');
        if (workingState) workingState.classList.add('visible');
        setStatus('Creating your Asana project and onboarding submission now.', '');

        try {
          const payload = { ...formData };
          delete payload.confirmAccurate;

          const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) {
            throw new Error(result.error || 'Submission failed.');
          }

          localStorage.removeItem(DRAFT_KEY);
          completed = true;
          setStatus("We've received your information and created your onboarding workspace. Our team will review everything and follow up with next steps within one business day.", 'success');
          renderSuccess(result);
          renderThankYou(result);
        } catch (error) {
          setStatus(error.message || 'Submission failed.', 'error');
        } finally {
          submitting = false;
          if (!completed) {
            nextBtn.disabled = false;
            backBtn.disabled = false;
            if (fillTestBtn) fillTestBtn.disabled = false;
            if (buttonRow) buttonRow.classList.remove('hidden');
            if (workingState) workingState.classList.remove('visible');
            updateButtons();
          }
        }
      });

      if (fillTestBtn) {
        fillTestBtn.addEventListener('click', () => {
          Object.assign(formData, structuredClone(TEST_PAYLOAD));
          formData.confirmAccurate = true;
          saveDraft();
          renderStep();
          updateProgress();
          setStatus('Test data loaded.', '');
        });
      }

      function renderStep() {
        const step = STEP_GROUPS[currentStep];
        if (step.id === 'review') {
          root.innerHTML = renderReviewStep(step);
        } else {
          root.innerHTML = renderFormStep(step, currentStep);
        }

        root.querySelectorAll('input, textarea, select').forEach((field) => {
          field.addEventListener('input', onFieldChange);
          field.addEventListener('change', onFieldChange);
        });

        root.querySelectorAll('[data-toggle-target]').forEach((button) => {
          button.addEventListener('click', () => {
            const target = document.getElementById(button.dataset.toggleTarget);
            if (!target) return;
            target.classList.toggle('open');
          });
        });
      }

      function renderFormStep(step, stepIndex) {
        const optional = optionalConfig[step.id];
        const coreFields = getCoreFields(step.id, step.fields);

        return \`
          <div class="meta">Step \${stepIndex + 1} of \${STEP_GROUPS.length}</div>
          <h2 class="title">\${escapeHtml(step.title)}</h2>
          \${step.eta ? \`<div class="meta">\${escapeHtml(step.eta)}</div>\` : ''}
          <p class="subtitle">\${escapeHtml(step.subtitle || '')}</p>
          <div class="grid">
            \${coreFields.map((field) => renderField(field)).join('')}
          </div>
          \${optional ? renderOptional(step.id, optional) : ''}
        \`;
      }

      function renderReviewStep(step) {
        return \`
          <div class="meta">Step \${STEP_GROUPS.length} of \${STEP_GROUPS.length}</div>
          <h2 class="title">\${escapeHtml(step.title)}</h2>
          <p class="subtitle">Please confirm the information below is accurate so our team can begin setup without delays.</p>
          <div class="review">
            \${reviewGroups.map(renderReviewCard).join('')}
          </div>
          <label class="confirm">
            <input type="checkbox" name="confirmAccurate" \${formData.confirmAccurate ? 'checked' : ''} />
            <span>I confirm the information provided is accurate and ready for the Shark Branding Solutions team to use for onboarding.</span>
          </label>
        \`;
      }

      function renderOptional(stepId, config) {
        return \`
          <div class="toggle">
            <button type="button" data-toggle-target="optional-\${stepId}">\${escapeHtml(config.toggleLabel)}</button>
            <p>\${escapeHtml(config.helper)}</p>
          </div>
          <div class="optional" id="optional-\${stepId}">
            \${config.groups.map((group) => \`
              <div style="margin-top:16px;">
                <div class="meta" style="margin-bottom:12px;">\${escapeHtml(group.title)}</div>
                <div class="grid">
                  \${group.fields.map((field) => renderField(field)).join('')}
                </div>
              </div>
            \`).join('')}
          </div>
        \`;
      }

      function renderField(name) {
        const config = schema[name];
        const value = formData[name] || '';
        const cls = config.full ? 'field full' : 'field';
        const req = config.required ? 'req' : '';

        if (config.type === 'textarea') {
          return \`<div class="\${cls}"><label for="\${name}" class="\${req}">\${config.label}</label><textarea id="\${name}" name="\${name}">\${escapeHtml(value)}</textarea></div>\`;
        }

        if (config.type === 'select') {
          return \`<div class="\${cls}"><label for="\${name}" class="\${req}">\${config.label}</label><select id="\${name}" name="\${name}">\${config.options.map((option) => \`<option value="\${escapeHtml(option)}" \${option === value ? 'selected' : ''}>\${option || 'Select...'}</option>\`).join('')}</select></div>\`;
        }

        return \`<div class="\${cls}"><label for="\${name}" class="\${req}">\${config.label}</label><input id="\${name}" name="\${name}" type="\${config.type || 'text'}" value="\${escapeHtml(value)}" /></div>\`;
      }

      function renderReviewCard(step) {
        const fields = step.fields.filter(Boolean);
        return \`<div class="review-card"><h3>\${escapeHtml(step.title)}</h3>\${fields.map((field) => \`<div class="review-item"><strong>\${escapeHtml(FIELD_LABELS[field] || field)}</strong><div>\${escapeHtml(formData[field] || 'Not provided')}</div></div>\`).join('')}</div>\`;
      }

      function getCoreFields(stepId, fields) {
        if (stepId === 'contacts') return ['contactName', 'contactEmail', 'contactPhone'];
        if (stepId === 'google') return ['gbpAccess', 'googleEmail'];
        if (stepId === 'social') return [];
        if (stepId === 'details') return ['bizCategory', 'bizHours', 'serviceAreas', 'marketingGoals'];
        return fields;
      }

      function onFieldChange(event) {
        if (event.target.type === 'checkbox') {
          formData[event.target.name] = event.target.checked;
        } else {
          formData[event.target.name] = event.target.value;
        }
        saveDraft();
        if (STEP_GROUPS[currentStep].id === 'review') {
          renderStep();
        }
      }

      function updateProgress() {
        const percent = Math.round(((currentStep + 1) / STEP_GROUPS.length) * 100);
        stepMeta.textContent = 'Step ' + (currentStep + 1) + ' of ' + STEP_GROUPS.length;
        progressBar.style.width = percent + '%';
        updateButtons();
      }

      function updateButtons() {
        backBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
        nextBtn.textContent = currentStep === STEP_GROUPS.length - 1 ? 'Submit & Start Onboarding →' : 'Continue →';
      }

      function validateStep(index) {
        const step = STEP_GROUPS[index];
        const fields = step.id === 'review' ? [] : step.fields;

        for (const field of fields) {
          const config = schema[field];
          if (!config) continue;
          const value = String(formData[field] || '').trim();
          if (config.required && !value) return config.label + ' is required.';
          if (config.type === 'email' && value && !value.includes('@')) return 'Please enter a valid email for ' + config.label + '.';
        }

        if (step.id === 'ads') {
          const mode = formData.runningAds || '';
          if ((mode === 'Google' || mode === 'Both') && !String(formData.googleAdsId || '').trim()) {
            return 'Google Ads ID is required when ads are running on Google.';
          }
          if ((mode === 'Meta' || mode === 'Both') && !String(formData.metaAdsId || '').trim()) {
            return 'Meta Ads ID is required when ads are running on Meta.';
          }
        }

        if (step.id === 'website' && formData.gtmInstalled === 'Yes') {
          if (!String(formData.gtmContainerId || '').trim()) return 'GTM Container ID is required when GTM is installed.';
          if (!String(formData.gtmAccessEmail || '').trim()) return 'GTM Access Email is required when GTM is installed.';
        }

        return '';
      }

      function validateAll() {
        for (let i = 0; i < STEP_GROUPS.length - 1; i += 1) {
          const error = validateStep(i);
          if (error) {
            currentStep = i;
            renderStep();
            updateProgress();
            return error;
          }
        }
        return '';
      }

      function renderSuccess(result) {
        linksEl.innerHTML = '';
      }

      function renderThankYou(result) {
        root.innerHTML = \`
          <div class="thanks-screen">
            <div class="thanks-logo">
              <img src="${LOGO_URL}" alt="Shark Branding Solutions" />
            </div>
            <h2>Thank you. Your onboarding has been submitted.</h2>
            <p>Our team has received your information and will review everything carefully. We’ll follow up with next steps within one business day.</p>
            <div class="thanks-card">
              <p><strong>Business:</strong> \${escapeHtml(formData.businessName || result.businessName || '')}</p>
              <p>You can close this page. No further action is needed right now.</p>
            </div>
          </div>
        \`;

        backBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
        if (buttonRow) {
          buttonRow.classList.add('hidden');
        }
        if (workingState) {
          workingState.classList.remove('visible');
        }
        if (fillTestBtn) {
          fillTestBtn.classList.add('hidden');
        }
      }

      function saveDraft() {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      }

      function loadDraft() {
        const base = Object.keys(schema).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {});
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          return raw ? { ...base, ...JSON.parse(raw) } : base;
        } catch {
          return base;
        }
      }

      function setStatus(message, tone) {
        statusEl.textContent = message;
        statusEl.className = 'status' + (tone ? ' ' + tone : '');
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }
    </script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlResponse(html) {
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      ...corsHeaders(),
    },
  });
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(),
    },
  });
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'Content-Type',
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
