// ============================================================
// Chapter: Stored Procedures
// ============================================================

function initProcedures() {
  document.getElementById('procUpdate')?.addEventListener('click', executeUpdateStatus);
  document.getElementById('procReport')?.addEventListener('click', executeGovtReport);
}

async function executeUpdateStatus() {
  const promise_id = document.getElementById('procPromiseId')?.value || 1;
  const status = document.getElementById('procStatus')?.value || 'In Progress';
  const progress = document.getElementById('procProgress')?.value || 50;
  const remarks = document.getElementById('procRemarks')?.value || 'Updated via dashboard';
  showLoading('procResults');
  const data = await apiPost('/procedures/update-status', { promise_id, status, progress, remarks });
  renderSQL('procSQL', data.sql || 'CALL Update_Promise_Status(...)');
  if (data.success) {
    renderTable('procResults', Array.isArray(data.results) ? data.results : [data.results]);
    renderExplanation('procExplanation', data.explanation, [
      '<strong>IN parameters:</strong> promise_id, status, progress, remarks',
      '<strong>OUT parameter:</strong> result_message returned to caller',
      '<strong>Validation:</strong> Completed requires 100%, Not Started requires 0%',
      '<strong>Transaction:</strong> Uses START TRANSACTION with ROLLBACK on error',
      '<strong>Exception handler:</strong> DECLARE EXIT HANDLER FOR SQLEXCEPTION'
    ]);
  } else {
    document.getElementById('procResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

async function executeGovtReport() {
  const govt_id = document.getElementById('procGovtId')?.value || 1;
  showLoading('procResults');
  const data = await apiPost('/procedures/government-report', { govt_id });
  renderSQL('procSQL', data.sql || `CALL Generate_Government_Report(${govt_id})`);
  if (data.success && Array.isArray(data.results)) {
    let html = '';
    data.results.forEach((resultSet, i) => {
      const rows = Array.isArray(resultSet) ? resultSet : [resultSet];
      if (rows.length > 0 && rows[0]) {
        html += `<h4 style="margin:12px 0 8px;color:#1a237e">Result Set ${i + 1}</h4>`;
        const container = document.createElement('div');
        container.id = `procResultSet${i}`;
        html += `<div id="procResultSet${i}"></div>`;
      }
    });
    document.getElementById('procResults').innerHTML = html;
    data.results.forEach((resultSet, i) => {
      const rows = Array.isArray(resultSet) ? resultSet : [resultSet];
      if (rows.length > 0 && rows[0]) renderTable(`procResultSet${i}`, rows);
    });
    renderExplanation('procExplanation', data.explanation, [
      '<strong>Multiple result sets:</strong> Procedure returns summary + details',
      '<strong>CALL statement:</strong> Executes the procedure',
      'First result: summary statistics',
      'Second result: detailed promise list'
    ]);
  } else {
    document.getElementById('procResults').innerHTML = `<div class="empty-state">❌ ${data.error || 'No results'}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', initProcedures);
