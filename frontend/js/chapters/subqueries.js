// ============================================================
// Chapter: Subqueries
// ============================================================

const subqueryQueries = [
  { id: 'below-average-progress', label: 'Below-Average Progress (Scalar Subquery)', endpoint: '/subqueries/below-average-progress', concepts: ['<strong>Scalar subquery:</strong> Returns a single value','<strong>WHERE + subquery:</strong> Filter using computed value','Inner query runs first, result used in outer WHERE'] },
  { id: 'above-average-promises', label: 'Above-Average Promise Count (Derived Table)', endpoint: '/subqueries/above-average-promises', concepts: ['<strong>Derived table:</strong> Subquery in FROM/HAVING','<strong>Two-level nesting:</strong> Subquery inside subquery','<strong>HAVING + subquery:</strong> Filter on aggregated groups'] },
  { id: 'no-completed-areas', label: 'Policy Areas with No Completed Promises (NOT IN)', endpoint: '/subqueries/no-completed-areas', concepts: ['<strong>NOT IN:</strong> Exclusion using subquery result set','Subquery returns a list of IDs','Outer query finds complement'] },
  { id: 'correlated-comparison', label: 'Each Promise vs Govt Average (Correlated)', endpoint: '/subqueries/correlated-comparison', concepts: ['<strong>Correlated subquery:</strong> References outer query','Re-executes for each outer row','Calculates deviation from group average'] },
  { id: 'exists-completed', label: 'Governments with Completed Promises (EXISTS)', endpoint: '/subqueries/exists-completed', concepts: ['<strong>EXISTS:</strong> Returns TRUE if subquery has any rows','More efficient than IN for existence checks','Stops scanning at first match'] }
];

function initSubqueries() {
  const select = document.getElementById('subSelect');
  if (!select) return;
  select.innerHTML = subqueryQueries.map(q => `<option value="${q.id}">${q.label}</option>`).join('');
  document.getElementById('subExecute')?.addEventListener('click', executeSubquery);
}

async function executeSubquery() {
  const sel = document.getElementById('subSelect');
  const q = subqueryQueries.find(x => x.id === sel.value);
  if (!q) return;
  showLoading('subResults');
  const data = await apiGet(q.endpoint);
  if (data.success) {
    renderSQL('subSQL', data.sql);
    renderMeta('subMeta', data.metadata);
    renderTable('subResults', data.results);
    renderExplanation('subExplanation', data.explanation, q.concepts);
  } else {
    document.getElementById('subResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', initSubqueries);
