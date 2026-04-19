// ============================================================
// Election Promises Tracker — Dashboard Data & Rendering
// ============================================================

// ── Sample Data (matches SQL inserts) ──

const policyAreas = [
  { id: 1, name: 'Healthcare', description: 'Public health services and medical infrastructure' },
  { id: 2, name: 'Education', description: 'Schools, colleges, and educational programs' },
  { id: 3, name: 'Infrastructure', description: 'Roads, bridges, public transportation' },
  { id: 4, name: 'Agriculture', description: 'Farming support, irrigation, rural development' },
  { id: 5, name: 'Employment', description: 'Job creation and skill development' },
  { id: 6, name: 'Environment', description: 'Pollution control and conservation' },
  { id: 7, name: 'Housing', description: 'Affordable housing and urban development' },
];

const governments = [
  { id: 1, party: 'Progressive Party', cm: 'Rajesh Kumar', startYear: 2018, endYear: 2023, majority: 'Majority', electionId: 1 },
  { id: 2, party: "People's Alliance", cm: 'Priya Sharma', startYear: 2023, endYear: null, majority: 'Coalition', electionId: 2 },
  { id: 3, party: 'Regional Front', cm: 'Amit Patel', startYear: 2020, endYear: null, majority: 'Majority', electionId: 3 },
];

const promises = [
  { id: 1, title: 'Universal Healthcare Coverage', description: 'Free healthcare for all citizens under poverty line', announcementYear: 2018, targetYear: 2022, govtId: 1, policyAreaId: 1, budget: 50000000, priority: 'High' },
  { id: 2, title: 'Digital Education Initiative', description: 'Tablets for all high school students', announcementYear: 2018, targetYear: 2020, govtId: 1, policyAreaId: 2, budget: 25000000, priority: 'High' },
  { id: 3, title: 'Metro Rail Expansion', description: 'Extend metro to 5 new districts', announcementYear: 2023, targetYear: 2028, govtId: 2, policyAreaId: 3, budget: 150000000, priority: 'High' },
  { id: 4, title: 'Farmer Income Doubling', description: 'Double farmer income through support schemes', announcementYear: 2018, targetYear: 2023, govtId: 1, policyAreaId: 4, budget: 75000000, priority: 'High' },
  { id: 5, title: 'Skill Development Centers', description: 'Establish 100 skill training centers', announcementYear: 2023, targetYear: 2025, govtId: 2, policyAreaId: 5, budget: 30000000, priority: 'Medium' },
];

const statuses = [
  { id: 1, promiseId: 1, status: 'In Progress', progress: 65, lastUpdated: '2023-12-15', remarks: 'Coverage expanded to 15 districts' },
  { id: 2, promiseId: 2, status: 'Completed', progress: 100, lastUpdated: '2021-03-20', remarks: 'All students received tablets' },
  { id: 3, promiseId: 3, status: 'In Progress', progress: 25, lastUpdated: '2024-01-10', remarks: 'Land acquisition in progress' },
  { id: 4, promiseId: 4, status: 'Completed', progress: 95, lastUpdated: '2023-11-30', remarks: 'Income increased by 89% on average' },
  { id: 5, promiseId: 5, status: 'In Progress', progress: 40, lastUpdated: '2024-02-05', remarks: '40 centers operational' },
];

const indicators = [
  { id: 1, name: 'Hospital Beds per 1000', unit: 'beds/1000', policyAreaId: 1, baseline: 1.2, target: 3.0 },
  { id: 2, name: 'Literacy Rate', unit: '%', policyAreaId: 2, baseline: 68.5, target: 85.0 },
  { id: 3, name: 'Road Quality Index', unit: 'score', policyAreaId: 3, baseline: 45.0, target: 75.0 },
  { id: 4, name: 'Average Farmer Income', unit: 'INR/yr', policyAreaId: 4, baseline: 75000, target: 150000 },
  { id: 5, name: 'Youth Employment Rate', unit: '%', policyAreaId: 5, baseline: 42.0, target: 65.0 },
];

const outcomeData = [
  { id: 1, year: 2019, value: 1.5, source: 'Health Ministry', group: 'National', indicatorId: 1, govtId: 1 },
  { id: 2, year: 2021, value: 2.2, source: 'Health Ministry', group: 'National', indicatorId: 1, govtId: 1 },
  { id: 3, year: 2020, value: 75.2, source: 'Census Department', group: 'National', indicatorId: 2, govtId: 1 },
  { id: 4, year: 2023, value: 79.8, source: 'Education Survey', group: 'National', indicatorId: 2, govtId: 1 },
  { id: 5, year: 2019, value: 82000, source: 'Agriculture Census', group: 'Rural', indicatorId: 4, govtId: 1 },
  { id: 6, year: 2023, value: 142000, source: 'Agriculture Census', group: 'Rural', indicatorId: 4, govtId: 1 },
];

const promiseIndicators = [
  { promiseId: 1, indicatorId: 1, impact: 'Increase hospital bed availability' },
  { promiseId: 2, indicatorId: 2, impact: 'Improve digital literacy' },
  { promiseId: 4, indicatorId: 4, impact: 'Directly increase farmer income' },
  { promiseId: 5, indicatorId: 5, impact: 'Improve youth employability' },
];


// ── Helper Functions ──

function getGovt(id) { return governments.find(g => g.id === id); }
function getPolicyArea(id) { return policyAreas.find(pa => pa.id === id); }
function getStatus(promiseId) { return statuses.find(s => s.promiseId === promiseId); }
function getIndicator(id) { return indicators.find(i => i.id === id); }

function formatBudget(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

function getProgressClass(pct) {
  if (pct >= 70) return 'high';
  if (pct >= 40) return 'medium';
  return 'low';
}

// ── Render KPI Cards ──

function renderKPIs() {
  const container = document.getElementById('kpiGrid');
  
  const totalPromises = promises.length;
  const completed = statuses.filter(s => s.status === 'Completed').length;
  const completionRate = ((completed / totalPromises) * 100).toFixed(1);
  const totalBudget = promises.reduce((sum, p) => sum + p.budget, 0);
  const avgProgress = (statuses.reduce((sum, s) => sum + s.progress, 0) / statuses.length).toFixed(1);

  const kpis = [
    { icon: '📋', label: 'Total Promises', value: totalPromises, trend: `${governments.length} Govts`, trendClass: 'neutral' },
    { icon: '✅', label: 'Completion Rate', value: `${completionRate}%`, trend: `${completed} done`, trendClass: 'up' },
    { icon: '💰', label: 'Total Budget', value: formatBudget(totalBudget), trend: `${promises.length} allocated`, trendClass: 'neutral' },
    { icon: '📊', label: 'Avg. Progress', value: `${avgProgress}%`, trend: 'Across all', trendClass: 'up' },
  ];

  container.innerHTML = kpis.map(kpi => `
    <div class="kpi-card animate-in">
      <div class="kpi-card__header">
        <div class="kpi-card__icon">${kpi.icon}</div>
        <span class="kpi-card__trend kpi-card__trend--${kpi.trendClass}">${kpi.trend}</span>
      </div>
      <div class="kpi-card__value">${kpi.value}</div>
      <div class="kpi-card__label">${kpi.label}</div>
    </div>
  `).join('');
}


// ── Render Promise Table ──

let currentFilter = 'All';
let searchTerm = '';

function renderTable() {
  const tbody = document.getElementById('promiseTableBody');
  
  let filtered = promises.map(p => {
    const govt = getGovt(p.govtId);
    const area = getPolicyArea(p.policyAreaId);
    const status = getStatus(p.id);
    return { ...p, govt, area, status };
  });

  // Apply filter
  if (currentFilter !== 'All') {
    filtered = filtered.filter(p => p.status && p.status.status === currentFilter);
  }

  // Apply search
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.govt.party.toLowerCase().includes(term) ||
      p.area.name.toLowerCase().includes(term)
    );
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td class="promise-title">${p.title}</td>
      <td>${p.govt.party}</td>
      <td>${p.area.name}</td>
      <td>
        <span class="badge badge--${getStatusClass(p.status.status)}">
          <span class="badge__dot"></span>
          ${p.status.status}
        </span>
      </td>
      <td>
        <div class="progress-bar">
          <div class="progress-bar__track">
            <div class="progress-bar__fill progress-bar__fill--${getProgressClass(p.status.progress)}" 
                 style="width: ${p.status.progress}%"></div>
          </div>
          <span class="progress-bar__label">${p.status.progress}%</span>
        </div>
      </td>
      <td class="budget-value">${formatBudget(p.budget)}</td>
      <td>
        <span class="badge badge--${p.priority.toLowerCase()}">${p.priority}</span>
      </td>
    </tr>
  `).join('');
}

function initTableFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTable();
    });
  });

  const searchInput = document.getElementById('tableSearch');
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderTable();
  });
}


// ── Render Government Scorecards ──

function renderScorecards() {
  const container = document.getElementById('scorecardGrid');

  const scorecards = governments.map(g => {
    const govtPromises = promises.filter(p => p.govtId === g.id);
    const govtStatuses = govtPromises.map(p => getStatus(p.id)).filter(Boolean);
    const completed = govtStatuses.filter(s => s.status === 'Completed').length;
    const inProgress = govtStatuses.filter(s => s.status === 'In Progress').length;
    const totalBudget = govtPromises.reduce((sum, p) => sum + p.budget, 0);
    const avgProgress = govtStatuses.length > 0
      ? (govtStatuses.reduce((sum, s) => sum + s.progress, 0) / govtStatuses.length).toFixed(1)
      : 0;
    const completionRate = govtPromises.length > 0
      ? ((completed / govtPromises.length) * 100).toFixed(1)
      : 0;

    return { ...g, totalPromises: govtPromises.length, completed, inProgress, totalBudget, avgProgress, completionRate };
  });

  container.innerHTML = scorecards.map(s => `
    <div class="scorecard animate-in">
      <div class="scorecard__header">
        <div class="scorecard__party">${s.party}</div>
        <div class="scorecard__cm">Led by <span>${s.cm}</span> · ${s.startYear}–${s.endYear || 'Present'}</div>
      </div>
      <div class="scorecard__body">
        <div class="scorecard__stats">
          <div class="scorecard__stat">
            <div class="scorecard__stat-value" style="color: var(--accent-indigo)">${s.totalPromises}</div>
            <div class="scorecard__stat-label">Promises</div>
          </div>
          <div class="scorecard__stat">
            <div class="scorecard__stat-value" style="color: var(--accent-emerald)">${s.completed}</div>
            <div class="scorecard__stat-label">Completed</div>
          </div>
          <div class="scorecard__stat">
            <div class="scorecard__stat-value" style="color: var(--accent-amber)">${s.inProgress}</div>
            <div class="scorecard__stat-label">In Progress</div>
          </div>
        </div>
        <div>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 4px;">
            Total Budget: <span style="color: var(--accent-emerald); font-family: var(--font-mono); font-weight: 600;">${formatBudget(s.totalBudget)}</span>
          </div>
        </div>
        <div class="scorecard__completion">
          <div class="scorecard__completion-header">
            <span class="scorecard__completion-label">Completion Rate</span>
            <span class="scorecard__completion-value">${s.completionRate}%</span>
          </div>
          <div class="scorecard__bar">
            <div class="scorecard__bar-fill" style="width: ${s.completionRate}%"></div>
          </div>
        </div>
        <div class="scorecard__completion" style="margin-top: var(--space-sm);">
          <div class="scorecard__completion-header">
            <span class="scorecard__completion-label">Avg. Progress</span>
            <span class="scorecard__completion-value">${s.avgProgress}%</span>
          </div>
          <div class="scorecard__bar">
            <div class="scorecard__bar-fill" style="width: ${s.avgProgress}%; background: var(--gradient-cyan)"></div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}


// ── Render Budget Bar Chart ──

function renderBudgetChart() {
  const container = document.getElementById('budgetChart');
  const maxBudget = Math.max(...promises.map(p => p.budget));

  const colors = [
    'var(--gradient-primary)',
    'var(--gradient-emerald)',
    'var(--gradient-amber)',
    'var(--gradient-blue)',
    'var(--gradient-cyan)',
  ];

  container.innerHTML = promises
    .sort((a, b) => b.budget - a.budget)
    .map((p, i) => {
      const widthPct = (p.budget / maxBudget * 100).toFixed(1);
      return `
        <div class="bar-chart__row animate-in">
          <div class="bar-chart__label" title="${p.title}">${p.title.length > 18 ? p.title.slice(0, 18) + '…' : p.title}</div>
          <div class="bar-chart__track">
            <div class="bar-chart__fill" style="width: ${widthPct}%; background: ${colors[i % colors.length]}">
              <span>${formatBudget(p.budget)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
}


// ── Render Status Donut Chart ──

function renderStatusDonut() {
  const container = document.getElementById('statusDonut');

  const statusCounts = {};
  statuses.forEach(s => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const total = statuses.length;
  const statusColors = {
    'Completed': '#10b981',
    'In Progress': '#f59e0b',
    'Not Started': '#64748b',
    'Delayed': '#f43f5e',
    'Abandoned': '#ef4444',
  };

  // Build SVG donut
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = [];
  const legendItems = [];

  Object.entries(statusCounts).forEach(([status, count]) => {
    const pct = count / total;
    const dashLength = pct * circumference;
    const color = statusColors[status] || '#6366f1';

    segments.push(`
      <circle cx="90" cy="90" r="${radius}" fill="none" stroke="${color}" stroke-width="18"
        stroke-dasharray="${dashLength} ${circumference - dashLength}"
        stroke-dashoffset="${-offset}"
        style="transition: stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out;"
      />
    `);

    legendItems.push(`
      <div class="donut-legend__item">
        <div class="donut-legend__color" style="background: ${color}"></div>
        <span>${status}</span>
        <span class="donut-legend__value">${count}</span>
      </div>
    `);

    offset += dashLength;
  });

  container.innerHTML = `
    <div class="donut-chart">
      <svg width="180" height="180" viewBox="0 0 180 180">
        ${segments.join('')}
      </svg>
      <div class="donut-chart__center">
        <div class="donut-chart__center-value">${total}</div>
        <div class="donut-chart__center-label">Total</div>
      </div>
    </div>
    <div class="donut-legend">
      ${legendItems.join('')}
    </div>
  `;
}


// ── Render Promise vs Outcome Cards ──

function renderOutcomeCards() {
  const container = document.getElementById('outcomeGrid');

  const cards = promiseIndicators.map(pi => {
    const promise = promises.find(p => p.id === pi.promiseId);
    const indicator = getIndicator(pi.indicatorId);
    const status = getStatus(pi.promiseId);
    const outcomes = outcomeData
      .filter(od => od.indicatorId === pi.indicatorId)
      .sort((a, b) => b.year - a.year);
    
    const latestOutcome = outcomes[0];
    let achievement = 0;
    if (latestOutcome && indicator.target !== indicator.baseline) {
      achievement = ((latestOutcome.value - indicator.baseline) / (indicator.target - indicator.baseline) * 100).toFixed(1);
    }

    const achievementColor = achievement >= 75 ? 'var(--accent-emerald)' 
      : achievement >= 50 ? 'var(--accent-amber)' 
      : 'var(--accent-rose)';

    return `
      <div class="outcome-card animate-in">
        <div class="outcome-card__title">${promise.title}</div>
        <div class="outcome-card__indicator">📏 ${indicator.name} (${indicator.unit})</div>
        <div class="outcome-card__metrics">
          <div class="outcome-card__metric">
            <div class="outcome-card__metric-value" style="color: var(--text-muted)">${indicator.baseline.toLocaleString()}</div>
            <div class="outcome-card__metric-label">Baseline</div>
          </div>
          <div class="outcome-card__metric">
            <div class="outcome-card__metric-value" style="color: var(--accent-cyan)">${latestOutcome ? latestOutcome.value.toLocaleString() : '—'}</div>
            <div class="outcome-card__metric-label">Current</div>
          </div>
          <div class="outcome-card__metric">
            <div class="outcome-card__metric-value" style="color: var(--accent-purple)">${indicator.target.toLocaleString()}</div>
            <div class="outcome-card__metric-label">Target</div>
          </div>
        </div>
        <div class="outcome-card__achievement">
          <div class="outcome-card__achievement-value" style="color: ${achievementColor}">${achievement}%</div>
          <div class="outcome-card__achievement-label">Target Achievement</div>
        </div>
        <div style="margin-top: var(--space-md); display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge--${getStatusClass(status.status)}">
            <span class="badge__dot"></span>
            ${status.status}
          </span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Promise Progress: ${status.progress}%</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = cards.join('');
}


// ── Render ER Diagram ──

function renderERDiagram() {
  const container = document.getElementById('erDiagram');

  const entities = [
    {
      name: 'POLICY_AREA',
      attrs: [
        { name: 'PolicyArea_ID', type: 'pk' },
        { name: 'Area_Name', type: '' },
        { name: 'Description', type: '' },
        { name: 'created_at', type: '' },
      ]
    },
    {
      name: 'ELECTION',
      attrs: [
        { name: 'Election_ID', type: 'pk' },
        { name: 'Year', type: '' },
        { name: 'Type', type: '' },
        { name: 'Total_Seats', type: '' },
        { name: 'election_date', type: '' },
      ]
    },
    {
      name: 'GOVERNMENT',
      attrs: [
        { name: 'Govt_ID', type: 'pk' },
        { name: 'Party_Name', type: '' },
        { name: 'Chief_Minister', type: '' },
        { name: 'Start_Year', type: '' },
        { name: 'Election_ID', type: 'fk' },
      ]
    },
    {
      name: 'PROMISE',
      attrs: [
        { name: 'Promise_ID', type: 'pk' },
        { name: 'Title', type: '' },
        { name: 'Budget_Allocated', type: '' },
        { name: 'Govt_ID', type: 'fk' },
        { name: 'PolicyArea_ID', type: 'fk' },
      ]
    },
    {
      name: 'IMPL_STATUS',
      attrs: [
        { name: 'Status_ID', type: 'pk' },
        { name: 'Promise_ID', type: 'fk' },
        { name: 'Status_Type', type: '' },
        { name: 'Progress_%', type: '' },
        { name: 'Last_Updated', type: '' },
      ]
    },
    {
      name: 'INDICATOR',
      attrs: [
        { name: 'Indicator_ID', type: 'pk' },
        { name: 'Indicator_Name', type: '' },
        { name: 'Unit', type: '' },
        { name: 'PolicyArea_ID', type: 'fk' },
        { name: 'baseline_value', type: '' },
      ]
    },
    {
      name: 'OUTCOME_DATA',
      attrs: [
        { name: 'Data_ID', type: 'pk' },
        { name: 'Year', type: '' },
        { name: 'Measured_Value', type: '' },
        { name: 'Indicator_ID', type: 'fk' },
        { name: 'Govt_ID', type: 'fk' },
      ]
    },
    {
      name: 'PROMISE_INDICATOR',
      attrs: [
        { name: 'Promise_ID', type: 'pk fk' },
        { name: 'Indicator_ID', type: 'pk fk' },
        { name: 'Target_Impact', type: '' },
      ]
    },
  ];

  container.innerHTML = entities.map(entity => `
    <div class="er-entity">
      <div class="er-entity__header">${entity.name}</div>
      <ul class="er-entity__attrs">
        ${entity.attrs.map(attr => `
          <li class="er-entity__attr ${attr.type.includes('pk') ? 'er-entity__attr--pk' : ''} ${attr.type.includes('fk') ? 'er-entity__attr--fk' : ''}">
            ${attr.type.includes('pk') ? '🔑' : attr.type.includes('fk') ? '🔗' : '•'}
            ${attr.name}
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}


// ── Smooth Scroll Navigation ──

function initNavigation() {
  document.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      document.querySelectorAll('.navbar__link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}


// ── Intersection Observer for Animations ──

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => {
    observer.observe(el);
  });
}


// ── Active Nav Highlight on Scroll ──

function initScrollSpy() {
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -80% 0px' });

  sections.forEach(section => observer.observe(section));
}


// ── Initialize Everything ──

document.addEventListener('DOMContentLoaded', () => {
  renderKPIs();
  renderTable();
  initTableFilters();
  renderScorecards();
  renderBudgetChart();
  renderStatusDonut();
  renderOutcomeCards();
  renderERDiagram();
  initNavigation();
  initScrollAnimations();
  initScrollSpy();
});
