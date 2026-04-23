// ============================================================
// Chapter: Views
// ============================================================

const viewQueries = [
  { id: 'active-dashboard', label: 'Active Promises Dashboard', endpoint: '/views/active-dashboard', viewName: 'Active_Promises_Dashboard', concepts: ['View filters to show only In Progress/Not Started promises','Adds computed Performance_Rating column using CASE','Joins 4 base tables into a single virtual table'] },
  { id: 'performance-scorecard', label: 'Government Performance Scorecard', endpoint: '/views/performance-scorecard', viewName: 'Government_Performance_Scorecard', concepts: ['Aggregates promise data per government','Calculates completion rate as percentage','Uses CASE inside SUM for conditional counting'] },
  { id: 'outcome-analysis', label: 'Promise vs Outcome Analysis', endpoint: '/views/outcome-analysis', viewName: 'Promise_Outcome_Analysis', concepts: ['Compares promise progress with actual indicator outcomes','Calculates Target_Achievement_Percentage','Joins across 6 tables'] },
  { id: 'area-effectiveness', label: 'Policy Area Effectiveness', endpoint: '/views/area-effectiveness', viewName: 'Policy_Area_Effectiveness', concepts: ['Evaluates each policy area holistically','Combines implementation progress + outcome metrics','Uses NULLIF to prevent division by zero'] }
];

function initViews() {
  const select = document.getElementById('viewSelect');
  if (!select) return;
  select.innerHTML = viewQueries.map(q => `<option value="${q.id}">${q.label}</option>`).join('');
  document.getElementById('viewExecute')?.addEventListener('click', executeView);
  document.getElementById('viewShowDef')?.addEventListener('click', showViewDefinition);
}

async function executeView() {
  const sel = document.getElementById('viewSelect');
  const q = viewQueries.find(x => x.id === sel.value);
  if (!q) return;
  showLoading('viewResults');
  const data = await apiGet(q.endpoint);
  if (data.success) {
    renderSQL('viewSQL', `SELECT * FROM ${q.viewName}`);
    renderMeta('viewMeta', data.metadata);
    renderTable('viewResults', data.results);
    renderExplanation('viewExplanation', data.explanation, q.concepts);
  } else {
    document.getElementById('viewResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

async function showViewDefinition() {
  const sel = document.getElementById('viewSelect');
  const q = viewQueries.find(x => x.id === sel.value);
  if (!q) return;
  const data = await apiGet(`/views/definition/${q.viewName}`);
  if (data.success && data.results.length) {
    const def = data.results[0]['Create View'] || JSON.stringify(data.results[0]);
    renderSQL('viewSQL', def);
  }
}

document.addEventListener('DOMContentLoaded', initViews);
