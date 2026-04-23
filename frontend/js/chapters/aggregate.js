// ============================================================
// Chapter: Aggregate Functions
// ============================================================

const aggregateQueries = [
  { id: 'count-by-status', label: 'Count Promises by Status', endpoint: '/aggregate/count-by-status', chartType: 'bar', concepts: ['<strong>COUNT(*):</strong> Counts rows in each group','<strong>GROUP BY:</strong> Groups rows sharing a column value','<strong>ORDER BY:</strong> Sorts results by column'] },
  { id: 'avg-progress-by-party', label: 'Average Progress by Party (HAVING)', endpoint: '/aggregate/avg-progress-by-party', chartType: 'horizontalBar', concepts: ['<strong>AVG():</strong> Calculates arithmetic mean','<strong>HAVING:</strong> Filters groups (unlike WHERE which filters rows)','<strong>JOIN:</strong> Combines data from multiple tables'] },
  { id: 'budget-by-area', label: 'Budget by Policy Area', endpoint: '/aggregate/budget-by-area', chartType: 'pie', concepts: ['<strong>SUM():</strong> Totals numeric values','<strong>LEFT JOIN:</strong> Includes areas with no promises','<strong>Multiple aggregates:</strong> SUM, COUNT, AVG in one query'] },
  { id: 'min-max-periods', label: 'MIN/MAX Implementation Periods', endpoint: '/aggregate/min-max-periods', chartType: null, concepts: ['<strong>MIN():</strong> Finds smallest value','<strong>MAX():</strong> Finds largest value','Works on numbers, dates, and strings'] },
  { id: 'performance-scorecard', label: 'Government Budget Scorecard', endpoint: '/aggregate/performance-scorecard', chartType: 'bar', concepts: ['<strong>All 5 aggregate functions:</strong> COUNT, SUM, MIN, MAX, AVG','<strong>GROUP BY with multiple columns</strong>','<strong>LEFT JOIN:</strong> Includes govts with no promises'] }
];

function initAggregate() {
  const select = document.getElementById('aggSelect');
  if (!select) return;
  select.innerHTML = aggregateQueries.map(q => `<option value="${q.id}">${q.label}</option>`).join('');
  select.addEventListener('change', () => loadAggregatePreview());
  document.getElementById('aggExecute')?.addEventListener('click', executeAggregate);
  loadAggregatePreview();
}

function loadAggregatePreview() {
  const sel = document.getElementById('aggSelect');
  const q = aggregateQueries.find(x => x.id === sel.value);
  if (!q) return;
  renderExplanation('aggExplanation', '...', q.concepts);
}

async function executeAggregate() {
  const sel = document.getElementById('aggSelect');
  const q = aggregateQueries.find(x => x.id === sel.value);
  if (!q) return;
  showLoading('aggResults');
  const data = await apiGet(q.endpoint);
  if (data.success) {
    renderSQL('aggSQL', data.sql);
    renderMeta('aggMeta', data.metadata);
    renderTable('aggResults', data.results);
    renderExplanation('aggExplanation', data.explanation, q.concepts);
    renderAggregateChart(q, data.results);
  } else {
    document.getElementById('aggResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

function renderAggregateChart(q, results) {
  if (!q.chartType || !results.length) return;
  const canvas = document.getElementById('aggChart');
  if (!canvas) return;
  canvas.parentElement.style.display = 'block';
  if (q.chartType === 'bar') {
    const labels = results.map(r => Object.values(r)[0]);
    const data = results.map(r => parseFloat(Object.values(r)[1]) || 0);
    createBarChart('aggChart', labels, [{ label: Object.keys(results[0])[1], data }], q.label);
  } else if (q.chartType === 'pie') {
    const labels = results.map(r => r.Area_Name || Object.values(r)[0]);
    const data = results.map(r => parseFloat(r.Total_Budget || Object.values(r)[1]) || 0);
    createPieChart('aggChart', labels, data, q.label);
  } else if (q.chartType === 'horizontalBar') {
    const labels = results.map(r => r.Party_Name || Object.values(r)[0]);
    const data = results.map(r => parseFloat(r.Avg_Progress || Object.values(r)[1]) || 0);
    createHorizontalBarChart('aggChart', labels, data, q.label);
  }
}

document.addEventListener('DOMContentLoaded', initAggregate);
