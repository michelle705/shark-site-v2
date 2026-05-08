const state = {
  projects: [],
  selectedProject: null,
  dashboard: null,
  loading: false,
};

const projectListEl = document.getElementById('projectList');
const projectTitleEl = document.getElementById('projectTitle');
const heroEyebrowEl = document.getElementById('heroEyebrow');
const projectCopyEl = document.getElementById('projectCopy');
const statsGridEl = document.getElementById('statsGrid');
const sourceGridEl = document.getElementById('sourceGrid');
const eventMetaEl = document.getElementById('eventMeta');
const eventListEl = document.getElementById('eventList');
const threatMetaEl = document.getElementById('threatMeta');
const threatListEl = document.getElementById('threatList');
const runMetaEl = document.getElementById('runMeta');
const runListEl = document.getElementById('runList');
const winnerMetaEl = document.getElementById('winnerMeta');
const winnerListEl = document.getElementById('winnerList');
const clusterMetaEl = document.getElementById('clusterMeta');
const clusterTableEl = document.getElementById('clusterTable');
const keywordTableEl = document.getElementById('keywordTable');
const opportunityTableEl = document.getElementById('opportunityTable');
const detailGridEl = document.getElementById('detailGrid');
const playbookGridEl = document.getElementById('playbookGrid');
const playbookEventsEl = document.getElementById('playbookEvents');
const guardrailListEl = document.getElementById('guardrailList');
const statusMessageEl = document.getElementById('statusMessage');
const refreshButton = document.getElementById('refreshDashboard');
const connectGscButton = document.getElementById('connectGsc');
const syncGscButton = document.getElementById('syncGsc');
const monitorButton = document.getElementById('runMonitor');

refreshButton.addEventListener('click', async () => {
  if (!state.selectedProject) {
    return;
  }

  await loadDashboard(state.selectedProject, { announce: 'Dashboard refreshed.' });
});

monitorButton.addEventListener('click', async () => {
  if (!state.selectedProject || state.loading) {
    return;
  }

  state.loading = true;
  setStatus(`Running live monitor for ${state.selectedProject}...`);
  syncActionButtons();

  try {
    const result = await fetchJson(`/api/project-monitor?project=${encodeURIComponent(state.selectedProject)}`, {
      method: 'POST',
    });
    setStatus(
      `Live monitor finished. Collected ${formatDateTime(result.collectedAt)} with ${result.outrankEventCount} outrank events. Telegram sent: ${result.telegramSent ? 'yes' : 'no'}.`,
    );
    await loadProjects();
    await loadDashboard(state.selectedProject);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    state.loading = false;
    syncActionButtons();
  }
});

connectGscButton.addEventListener('click', async () => {
  try {
    const status = await fetchJson('/api/gsc/status');
    if (!status.configured) {
      setStatus('Set LIVING_SEO_GSC_CLIENT_ID, LIVING_SEO_GSC_CLIENT_SECRET, and LIVING_SEO_GSC_SITE_URL in living-seo/.env before connecting GSC.', true);
      return;
    }

    window.location.href = '/api/gsc/connect/start';
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  }
});

syncGscButton.addEventListener('click', async () => {
  if (!state.selectedProject || state.loading) {
    return;
  }

  state.loading = true;
  setStatus(`Syncing GSC close wins for ${state.selectedProject}...`);
  syncActionButtons();

  try {
    const result = await fetchJson(`/api/gsc/sync?project=${encodeURIComponent(state.selectedProject)}`, {
      method: 'POST',
    });
    setStatus(`GSC sync finished. Loaded ${result.rows.length} close-win queries from ${result.property}.`);
    await loadDashboard(state.selectedProject);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    state.loading = false;
    syncActionButtons();
  }
});

bootstrap().catch((error) => {
  setStatus(error instanceof Error ? error.message : String(error), true);
});

async function bootstrap() {
  await loadProjects();
  if (!state.projects.length) {
    setStatus('No Living SEO projects were found in /projects.', true);
    return;
  }

  state.selectedProject = state.projects.find((project) => /wesley-chapel/i.test(project.slug))?.slug || state.projects[0].slug;
  renderProjectList();
  await loadDashboard(state.selectedProject, { announce: 'Dashboard ready.' });
}

async function loadProjects() {
  const data = await fetchJson('/api/projects');
  state.projects = data.projects || [];
  renderProjectList();
}

async function loadDashboard(projectSlug, options = {}) {
  state.loading = true;
  state.selectedProject = projectSlug;
  renderProjectList();
  syncActionButtons();
  setStatus(`Loading ${projectSlug}...`);

  try {
    state.dashboard = await fetchJson(`/api/projects/${encodeURIComponent(projectSlug)}/dashboard`);
    renderDashboard();
    setStatus(options.announce || `Loaded ${state.dashboard.project.projectName}.`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    state.loading = false;
    syncActionButtons();
  }
}

function renderProjectList() {
  if (!state.projects.length) {
    projectListEl.innerHTML = '<div class="empty">No projects found.</div>';
    return;
  }

  projectListEl.innerHTML = state.projects.map((project) => {
    const activeClass = project.slug === state.selectedProject ? 'active' : '';
    return `
      <button class="project-card ${activeClass}" data-project="${escapeHtml(project.slug)}">
        <strong>${escapeHtml(project.projectName)}</strong>
        <div class="project-meta">
          <span>${escapeHtml(project.businessDomain || 'No domain')}</span>
          <span>${project.keywordCount} keywords</span>
        </div>
        <div class="mini-row" style="margin-top:10px;">
          <span class="pill ${statusTone(project.status)}">${escapeHtml(project.status)}</span>
          <span class="pill">${project.top3Count} top 3</span>
          <span class="pill">${project.outrankEventCount} risks</span>
        </div>
      </button>
    `;
  }).join('');

  for (const button of projectListEl.querySelectorAll('[data-project]')) {
    button.addEventListener('click', async () => {
      const projectSlug = button.getAttribute('data-project');
      if (!projectSlug || projectSlug === state.selectedProject) {
        return;
      }

      await loadDashboard(projectSlug);
    });
  }
}

function renderDashboard() {
  if (!state.dashboard) {
    return;
  }

  const { project, integrations, latestAnalysis, latestRun, runHistory, keywordPerformance, outrankPlan } = state.dashboard;
  const winners = (keywordPerformance.rows || []).filter((row) => row.yourBestPosition === 1);
  heroEyebrowEl.textContent = `${humanizeStatus(project.status)} Project`;
  projectTitleEl.textContent = project.projectName;
  projectCopyEl.textContent = `${project.business?.domain || 'No domain configured'} is being defended across ${project.keywordCount} tracked keywords. Focus area: ${project.primaryLocation || 'all tracked locations'}.`;

  statsGridEl.innerHTML = renderStats([
    ['Tracked Keywords', project.keywordCount],
    ['Top 3 Now', keywordPerformance.summary.top3Count],
    ['Top 10 Now', keywordPerformance.summary.top10Count],
    ['Outrank Events', latestAnalysis.available ? latestAnalysis.summary.outrankEventCount : '-'],
    ['Stored Runs', project.runCount],
  ]);

  sourceGridEl.innerHTML = [
    renderSourceCard(
      'Keyword Discovery',
      integrations.searchConsole.connected
        ? 'Search Console connected'
        : integrations.searchConsole.configured
          ? 'Search Console ready to connect'
          : 'Search Console not configured',
      integrations.searchConsole.connected
        ? `Property: ${integrations.searchConsole.property}. Last sync: ${formatDateTime(integrations.searchConsole.lastSyncAt)}`
        : integrations.searchConsole.configured
          ? `Property: ${integrations.searchConsole.property}. Use Connect GSC to complete OAuth.`
          : 'Recommended next step: add GSC OAuth env vars, then connect and sync near-win queries.',
      integrations.searchConsole.connected ? 'ok' : 'warn',
    ),
    renderSourceCard(
      'Live SERP Checks',
      integrations.serp.configured ? `${integrations.serp.provider} ready` : 'SERP API not configured',
      integrations.serp.configured
        ? 'Live ranking checks can refresh the watchlist and capture competitor movement.'
        : 'A live SERP API is required for current position checks and competitor monitoring.',
      integrations.serp.configured ? 'ok' : 'warn',
    ),
    renderSourceCard(
      'Telegram Alerts',
      integrations.telegram.configured ? 'Telegram ready' : 'Telegram optional',
      integrations.telegram.configured
        ? 'Alerting can push monitor results to the bot after each run.'
        : 'Keep disabled if you only want the dashboard and local operator workflow.',
      integrations.telegram.configured ? 'ok' : 'warn',
    ),
  ].join('');

  eventMetaEl.textContent = latestAnalysis.available
    ? `${latestAnalysis.summary.outrankEventCount} active outrank events`
    : latestAnalysis.error;
  eventListEl.innerHTML = renderEvents(latestAnalysis);
  threatMetaEl.textContent = latestAnalysis.available
    ? `${latestAnalysis.summary.climbingThreatCount || 0} climbing threats`
    : latestAnalysis.error;
  threatListEl.innerHTML = renderThreats(latestAnalysis);

  runMetaEl.textContent = latestRun
    ? `Last run ${formatDateTime(latestRun.collectedAt)} via ${latestRun.provider}`
    : 'No stored runs yet';
  runListEl.innerHTML = renderRuns(runHistory, latestRun);
  winnerMetaEl.textContent = `${winners.length} current #1 keywords`;
  winnerListEl.innerHTML = renderWinners(winners);
  clusterMetaEl.textContent = renderClusterMeta(state.dashboard.pageCluster);
  clusterTableEl.innerHTML = renderClusterTable(state.dashboard.pageCluster);

  keywordTableEl.innerHTML = renderKeywordTable(
    state.dashboard.closeWinKeywords || keywordPerformance.rows,
    project.primaryLocation,
    'close wins',
  );
  opportunityTableEl.innerHTML = renderKeywordTable(
    state.dashboard.localOpportunityKeywords || [],
    project.primaryLocation,
    'local opportunities',
  );

  detailGridEl.innerHTML = [
    renderDetailCard(
      'Business Domain',
      project.business?.domain || 'Not configured',
      `Latest provider: ${project.lastProvider || 'none'}`,
    ),
    renderDetailCard(
      'Watched Competitors',
      String(project.watchedCompetitors.length),
      project.watchedCompetitors.length
        ? project.watchedCompetitors.map((item) => item.domain || item).join(', ')
        : 'No competitor domains configured yet.',
    ),
    renderDetailCard(
      'Tracked Locations',
      String(project.trackedLocations.length),
      project.trackedLocations.join(', ') || 'No locations configured.',
    ),
  ].join('');

  playbookGridEl.innerHTML = renderPlaybook(outrankPlan);
  playbookEventsEl.innerHTML = renderPlaybookEvents(outrankPlan);

  guardrailListEl.innerHTML = latestAnalysis.available
    ? `<div class="detail-card"><ul>${latestAnalysis.guardrails.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`
    : '<div class="empty">Analysis guardrails will appear after at least two runs exist.</div>';
}

function renderStats(items) {
  return items.map(([label, value]) => `
    <article class="stat">
      <div class="stat-label">${escapeHtml(label)}</div>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `).join('');
}

function renderSourceCard(title, stateText, detail, tone) {
  return `
    <article class="source-card">
      <div class="pill ${tone}">${escapeHtml(stateText)}</div>
      <h4 style="margin-top:12px;">${escapeHtml(title)}</h4>
      <p class="muted" style="margin-bottom:0;">${escapeHtml(detail)}</p>
    </article>
  `;
}

function renderEvents(latestAnalysis) {
  if (!latestAnalysis.available) {
    return `<div class="empty">${escapeHtml(latestAnalysis.error)}</div>`;
  }

  if (!latestAnalysis.outrankEvents.length) {
    return '<div class="empty">No outrank events detected in the latest comparison window.</div>';
  }

  return latestAnalysis.outrankEvents.map((event) => {
    const signals = event.detectedChange.signals.length
      ? `<ul>${event.detectedChange.signals.map((signal) => `<li>${escapeHtml(signal.summary)}</li>`).join('')}</ul>`
      : '<p class="muted">No strong on-page change was isolated.</p>';

    const actions = `<ul>${event.recommendedActions.map((action) => `
      <li>
        <strong>${escapeHtml(action.type)}</strong>: ${escapeHtml(action.reason)}
      </li>
    `).join('')}</ul>`;

    return `
      <article class="event-card">
        <div class="mini-row">
          <span class="pill danger">#${event.currentPositions.competitor} competitor</span>
          <span class="pill">${escapeHtml(event.location || 'default')}</span>
          ${event.watchedCompetitor ? '<span class="pill warn">watched competitor</span>' : ''}
        </div>
        <h4 style="margin-top:12px;">${escapeHtml(event.keyword)}</h4>
        <p class="muted">Your site moved from #${event.previousPositions.yourSite} to #${event.currentPositions.yourSite}. ${escapeHtml(event.competitorDomain)} moved from #${event.previousPositions.competitor} to #${event.currentPositions.competitor}.</p>
        <h4>Detected shifts</h4>
        ${signals}
        <h4>Recommended response</h4>
        ${actions}
      </article>
    `;
  }).join('');
}

function renderThreats(latestAnalysis) {
  if (!latestAnalysis.available) {
    return `<div class="empty">${escapeHtml(latestAnalysis.error)}</div>`;
  }

  if (!latestAnalysis.climbingThreatEvents?.length) {
    return '<div class="empty">No competitors are currently closing the gap in the latest comparison window.</div>';
  }

  return latestAnalysis.climbingThreatEvents.map((event) => `
    <article class="event-card">
      <div class="mini-row">
        <span class="pill ${event.threatLevel === 'imminent' ? 'danger' : 'warn'}">${escapeHtml(event.threatLevel)}</span>
        <span class="pill">${escapeHtml(event.location || 'default')}</span>
        ${event.watchedCompetitor ? '<span class="pill warn">watched competitor</span>' : ''}
      </div>
      <h4 style="margin-top:12px;">${escapeHtml(event.keyword)}</h4>
      <p class="muted">${escapeHtml(event.competitorDomain)} moved from #${event.previousPositions.competitor} to #${event.currentPositions.competitor}. You are currently #${event.currentPositions.yourSite}. Gap closed from ${event.gapBefore} to ${event.gapNow}.</p>
      <ul>
        ${event.recommendedActions.map((action) => `<li><strong>${escapeHtml(action.type)}</strong>: ${escapeHtml(action.reason)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function renderRuns(runHistory, latestRun) {
  if (!runHistory.length) {
    return '<div class="empty">No stored runs yet. Run the monitor to create the first snapshot.</div>';
  }

  return runHistory.map((run, index) => `
    <article class="run-item">
      <h4>${index === 0 ? 'Latest stored run' : `Run ${runHistory.length - index}`}</h4>
      <div class="mini-row">
        <span>${escapeHtml(formatDateTime(run.collectedAt))}</span>
        ${index === 0 && latestRun ? `<span>${latestRun.keywordCount} keywords</span>` : ''}
        ${index === 0 && latestRun ? `<span>${latestRun.snapshotCount} snapshots</span>` : ''}
      </div>
      <p class="muted" style="margin:10px 0 0;">${escapeHtml(run.fileName)}</p>
    </article>
  `).join('');
}

function renderWinners(rows) {
  if (!rows.length) {
    return '<div class="empty">No current #1 keywords are visible in the latest run.</div>';
  }

  return rows.map((row) => `
    <article class="event-card">
      <div class="mini-row">
        <span class="pill ok">#1 now</span>
        <span class="pill">${escapeHtml(row.location || 'default')}</span>
      </div>
      <h4 style="margin-top:12px;">${escapeHtml(row.keyword)}</h4>
      <p class="muted">${escapeHtml(row.yourUrl || 'Current winning URL unavailable')}</p>
    </article>
  `).join('');
}

function renderKeywordTable(rows, primaryLocation, label = 'close-win keywords') {
  if (!rows.length) {
    return `<div class="empty">No ${escapeHtml(label)} are visible right now for ${escapeHtml(primaryLocation || 'this project')}.</div>`;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Keyword</th>
          <th>Your Position</th>
          <th>Status</th>
          <th>Top SERP Occupant</th>
          <th>Watched Competitor</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>
              <strong>${escapeHtml(row.keyword)}</strong>
              <div class="muted">${escapeHtml(row.device)}</div>
            </td>
            <td>${row.yourBestPosition ? `#${row.yourBestPosition}` : 'Not found'}</td>
            <td><span class="badge ${escapeHtml(row.status)}">${escapeHtml(humanizeStatus(row.status))}</span></td>
            <td>${escapeHtml(formatSerpOccupant(row))}</td>
            <td>${escapeHtml(formatWatchedCompetitor(row))}</td>
            <td>${escapeHtml(row.location || 'default')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderClusterMeta(cluster) {
  if (!cluster?.items?.length) {
    return 'No focused page cluster is configured for this project yet.';
  }

  return `${cluster.summary.top3Count} in top 3, ${cluster.summary.unrankedCount} unranked, ${cluster.summary.trackedCount} tracked terms`;
}

function renderClusterTable(cluster) {
  if (!cluster?.items?.length) {
    return '<div class="empty">No focused page cluster is configured for this project yet.</div>';
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Keyword</th>
          <th>Mapped Page</th>
          <th>Your Position</th>
          <th>Status</th>
          <th>Top SERP Occupant</th>
          <th>Watched Competitor</th>
        </tr>
      </thead>
      <tbody>
        ${cluster.items.map((item) => `
          <tr>
            <td>
              <strong>${escapeHtml(item.keyword)}</strong>
              <div class="muted">${escapeHtml(item.location || cluster.location || 'default')}</div>
            </td>
            <td>${escapeHtml(formatClusterPage(item))}</td>
            <td>${item.yourBestPosition ? `#${item.yourBestPosition}` : 'Not found'}</td>
            <td><span class="badge ${escapeHtml(item.status)}">${escapeHtml(humanizeStatus(item.status))}</span></td>
            <td>${escapeHtml(formatSerpOccupant(item))}</td>
            <td>${escapeHtml(formatWatchedCompetitor(item))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderDetailCard(title, value, detail) {
  return `
    <article class="detail-card">
      <div class="stat-label">${escapeHtml(title)}</div>
      <h4 style="margin-top:8px;">${escapeHtml(value)}</h4>
      <p class="muted" style="margin-bottom:0;">${escapeHtml(detail)}</p>
    </article>
  `;
}

function renderPlaybook(plan) {
  if (!plan?.pillars?.length) {
    return '<div class="empty">No outrank playbook is available yet.</div>';
  }

  return plan.pillars.map((pillar) => `
    <article class="detail-card">
      <div class="stat-label">${escapeHtml(pillar.title)}</div>
      <h4 style="margin-top:8px;">${escapeHtml(pillar.description)}</h4>
      <p class="muted">Priority keywords: ${pillar.opportunities.length || 0}</p>
      <ul>
        ${pillar.moves.map((move) => `<li>${escapeHtml(move)}</li>`).join('')}
      </ul>
      <p class="muted" style="margin-top:10px; margin-bottom:0;">
        Focus keywords: ${escapeHtml(formatPlaybookKeywords(pillar.opportunities))}
      </p>
    </article>
  `).join('');
}

function renderPlaybookEvents(plan) {
  if (!plan?.eventActions?.length) {
    return '<div class="empty">No live outrank incidents right now. Use the playbook above to strengthen positions before they slip.</div>';
  }

  return plan.eventActions.map((event) => `
    <article class="event-card">
      <div class="mini-row">
        <span class="pill warn">${escapeHtml(event.lane)}</span>
        <span class="pill">${escapeHtml(event.competitorDomain)}</span>
      </div>
      <h4 style="margin-top:12px;">${escapeHtml(event.keyword)}</h4>
      <ul>
        ${event.actions.map((action) => `<li><strong>${escapeHtml(action.type)}</strong>: ${escapeHtml(action.reason)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function setStatus(message, isError = false) {
  statusMessageEl.textContent = message;
  statusMessageEl.style.borderColor = isError ? 'rgba(255, 126, 126, 0.35)' : '';
  statusMessageEl.style.color = isError ? 'var(--danger)' : '';
}

function syncActionButtons() {
  refreshButton.disabled = state.loading;
  connectGscButton.disabled = state.loading;
  syncGscButton.disabled = state.loading;
  monitorButton.disabled = state.loading;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
}

function formatDateTime(value) {
  if (!value) {
    return 'never';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function humanizeStatus(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (part) => part.toUpperCase());
}

function formatSerpOccupant(row) {
  if (!row.topSerpOccupantDomain) {
    return '-';
  }

  if (row.topSerpOccupantPosition) {
    return `${row.topSerpOccupantDomain} (#${row.topSerpOccupantPosition})`;
  }

  return row.topSerpOccupantDomain;
}

function formatWatchedCompetitor(row) {
  if (!row.topWatchedCompetitorDomain) {
    return 'None ranking';
  }

  const label = row.topWatchedCompetitorName || row.topWatchedCompetitorDomain;
  if (row.topWatchedCompetitorPosition) {
    return `${label} (#${row.topWatchedCompetitorPosition})`;
  }

  return label;
}

function formatClusterPage(item) {
  if (!item.pagePath) {
    return item.pageLabel || 'Not mapped';
  }

  return `${item.pageLabel} (${item.pagePath})`;
}

function formatPlaybookKeywords(items) {
  if (!items?.length) {
    return 'none yet';
  }

  return items
    .map((item) => item.position ? `${item.keyword} (#${item.position})` : `${item.keyword} (not found)`)
    .join(', ');
}

function statusTone(status) {
  if (status === 'stable' || status === 'leader') {
    return 'ok';
  }

  if (status === 'at-risk' || status === 'unranked' || status === 'buried') {
    return 'danger';
  }

  return 'warn';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
