// ============================================================
// Chapter: Set Operations
// ============================================================

const setQueries = [
  { id: 'union-high-priority', label: 'High-Priority Items (UNION)', endpoint: '/sets/union-high-priority', concepts: ['<strong>UNION:</strong> Combines two SELECT results, removes duplicates','Both SELECTs must have same number of columns','Column names come from the first SELECT'] },
  { id: 'union-all', label: 'All Names with Duplicates (UNION ALL)', endpoint: '/sets/union-all', concepts: ['<strong>UNION ALL:</strong> Keeps all rows including duplicates','Faster than UNION (no dedup step)','Use when duplicates are acceptable'] },
  { id: 'intersect-areas', label: 'Areas with Both Promises & Outcomes (INTERSECT)', endpoint: '/sets/intersect-areas', concepts: ['<strong>Simulated INTERSECT:</strong> IN + IN','Finds rows in both sets','MySQL < 8.0.31 lacks native INTERSECT'] },
  { id: 'except-no-indicators', label: 'Promises without Indicators (EXCEPT)', endpoint: '/sets/except-no-indicators', concepts: ['<strong>Simulated EXCEPT:</strong> NOT IN','Returns rows from first set absent in second','Also called set difference'] },
  { id: 'except-no-outcomes', label: 'Areas with Promises but No Outcomes', endpoint: '/sets/except-no-outcomes', concepts: ['Combines IN + NOT IN','Positive filter (has promises) AND negative filter (no outcomes)'] },
  { id: 'completed-and-inprogress', label: 'Completed + In Progress (UNION)', endpoint: '/sets/completed-and-inprogress', concepts: ['Each SELECT filters different status','UNION merges into single result set'] }
];

function initSets() {
  const select = document.getElementById('setSelect');
  if (!select) return;
  select.innerHTML = setQueries.map(q => `<option value="${q.id}">${q.label}</option>`).join('');
  document.getElementById('setExecute')?.addEventListener('click', executeSet);
}

async function executeSet() {
  const sel = document.getElementById('setSelect');
  const q = setQueries.find(x => x.id === sel.value);
  if (!q) return;
  showLoading('setResults');
  const data = await apiGet(q.endpoint);
  if (data.success) {
    renderSQL('setSQL', data.sql);
    renderMeta('setMeta', data.metadata);
    renderTable('setResults', data.results);
    renderExplanation('setExplanation', data.explanation, q.concepts);
  } else {
    document.getElementById('setResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', initSets);
