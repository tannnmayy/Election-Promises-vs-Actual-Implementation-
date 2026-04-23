// ============================================================
// Chapter: Cursors
// ============================================================

function initCursors() {
  document.getElementById('curOverdue')?.addEventListener('click', executeBulkOverdue);
  document.getElementById('curReports')?.addEventListener('click', executeAllReports);
}

async function executeBulkOverdue() {
  showLoading('curResults');
  const data = await apiPost('/cursors/bulk-update-overdue');
  if (data.success) {
    renderSQL('curSQL', data.sql);
    let html = '';
    if (data.results.cursorOutput) {
      html += '<h4 style="margin:0 0 8px;color:#1a237e">🔄 Cursor Output</h4><div id="curOutput"></div>';
    }
    if (data.results.currentState) {
      html += '<h4 style="margin:16px 0 8px;color:#1a237e">📋 Current State After Cursor</h4><div id="curState"></div>';
    }
    document.getElementById('curResults').innerHTML = html;
    const output = data.results.cursorOutput;
    if (Array.isArray(output) && output.length) renderTable('curOutput', Array.isArray(output[0]) ? output[0] : output);
    if (data.results.currentState) renderTable('curState', data.results.currentState);
    renderExplanation('curExplanation', data.explanation, [
      '<strong>DECLARE CURSOR:</strong> Defines a cursor over a SELECT result',
      '<strong>OPEN / FETCH / CLOSE:</strong> Cursor lifecycle',
      '<strong>CONTINUE HANDLER FOR NOT FOUND:</strong> Exits loop when no more rows',
      'Cursor processes rows one at a time in a LOOP',
      'Each overdue promise (past target year) is marked as Delayed'
    ]);
  } else {
    document.getElementById('curResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

async function executeAllReports() {
  showLoading('curResults');
  const data = await apiPost('/cursors/all-govt-reports');
  if (data.success) {
    renderSQL('curSQL', data.sql);
    const results = Array.isArray(data.results) ? data.results : [data.results];
    const flat = results.flat ? results.flat() : results;
    renderTable('curResults', Array.isArray(flat[0]) ? flat[0] : flat);
    renderExplanation('curExplanation', data.explanation, [
      'Iterates through all governments using a cursor',
      'For each government, calculates AVG progress and completion rate',
      'Assigns a grade (A/B/C/D) based on completion rate',
      'Results stored in a temporary table, then displayed'
    ]);
  } else {
    document.getElementById('curResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', initCursors);
