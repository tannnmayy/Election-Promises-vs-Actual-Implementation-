// ============================================================
// Chapter: Joins
// ============================================================

const joinQueries = [
  { id: 'promise-details', label: 'Complete Promise Analysis (INNER JOIN)', endpoint: '/joins/promise-details', concepts: ['<strong>INNER JOIN:</strong> Only matching rows from both tables','Multi-table join (4 tables)','DATEDIFF calculates days between dates'] },
  { id: 'promises-with-outcomes', label: 'Promises with Optional Outcomes (LEFT JOIN)', endpoint: '/joins/promises-with-outcomes', concepts: ['<strong>LEFT JOIN:</strong> All rows from left table, NULLs for unmatched right','Preserves promises without indicators','Multiple LEFT JOINs chained'] },
  { id: 'all-policy-areas', label: 'All Policy Areas (RIGHT JOIN)', endpoint: '/joins/all-policy-areas', concepts: ['<strong>RIGHT JOIN:</strong> All rows from right table preserved','Shows policy areas even without promises','Equivalent to LEFT JOIN with tables swapped'] },
  { id: 'government-comparison', label: 'Government Comparison Matrix (CROSS JOIN)', endpoint: '/joins/government-comparison', concepts: ['<strong>CROSS JOIN:</strong> Cartesian product of two tables','WHERE g1 < g2 avoids duplicate pairs','Creates comparison matrix'] },
  { id: 'self-join', label: 'Compare Promises in Same Govt (SELF JOIN)', endpoint: '/joins/self-join', concepts: ['<strong>SELF JOIN:</strong> Table joined with itself','Aliases (p1, p2) differentiate copies','p1.ID < p2.ID ensures unique pairs'] }
];

function initJoins() {
  const select = document.getElementById('joinSelect');
  if (!select) return;
  select.innerHTML = joinQueries.map(q => `<option value="${q.id}">${q.label}</option>`).join('');
  document.getElementById('joinExecute')?.addEventListener('click', executeJoin);
}

async function executeJoin() {
  const sel = document.getElementById('joinSelect');
  const q = joinQueries.find(x => x.id === sel.value);
  if (!q) return;
  showLoading('joinResults');
  const data = await apiGet(q.endpoint);
  if (data.success) {
    renderSQL('joinSQL', data.sql);
    renderMeta('joinMeta', data.metadata);
    renderTable('joinResults', data.results);
    renderExplanation('joinExplanation', data.explanation, q.concepts);
  } else {
    document.getElementById('joinResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', initJoins);
