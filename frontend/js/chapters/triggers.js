// ============================================================
// Chapter: Triggers
// ============================================================

function initTriggers() {
  document.getElementById('trgList')?.addEventListener('click', listTriggers);
  document.getElementById('trgTest')?.addEventListener('click', testTrigger);
  document.getElementById('trgAudit')?.addEventListener('click', showAuditLog);
}

async function listTriggers() {
  showLoading('trgResults');
  const data = await apiGet('/triggers/list');
  if (data.success) {
    renderSQL('trgSQL', data.sql);
    renderTable('trgResults', data.results);
    renderExplanation('trgExplanation', data.explanation, [
      '<strong>SHOW TRIGGERS:</strong> Lists all database triggers',
      'Each trigger has: name, event, timing, table, statement',
      'Our database has 4 triggers on IMPLEMENTATION_STATUS and PROMISE'
    ]);
  }
}

async function testTrigger() {
  const promiseId = document.getElementById('trgPromiseId')?.value || 1;
  const progress = document.getElementById('trgProgress')?.value || 70;
  showLoading('trgResults');
  const data = await apiPost('/triggers/test-update', { promise_id: promiseId, progress });
  if (data.success) {
    renderSQL('trgSQL', data.sql);
    const { before, after, auditLog } = data.results;
    let html = '<h4 style="margin:0 0 8px;color:#1a237e">📋 Before Update</h4><div id="trgBefore"></div>';
    html += '<h4 style="margin:16px 0 8px;color:#1a237e">📋 After Update (Trigger Fired)</h4><div id="trgAfter"></div>';
    html += '<h4 style="margin:16px 0 8px;color:#1a237e">📋 Audit Log (from trg_log_status_change)</h4><div id="trgAuditTable"></div>';
    document.getElementById('trgResults').innerHTML = html;
    if (before) renderTable('trgBefore', [before]);
    if (after) renderTable('trgAfter', [after]);
    if (auditLog) renderTable('trgAuditTable', auditLog);
    renderExplanation('trgExplanation', data.explanation, [
      '<strong>trg_update_timestamp:</strong> BEFORE UPDATE — auto-sets Last_Updated_Date',
      '<strong>trg_validate_progress:</strong> BEFORE INSERT — validates 0-100 range',
      '<strong>trg_log_status_change:</strong> AFTER UPDATE — logs to PROMISE_AUDIT_LOG',
      '<strong>trg_prevent_promise_deletion:</strong> BEFORE DELETE — blocks if outcomes exist'
    ]);
  }
}

async function showAuditLog() {
  showLoading('trgResults');
  const data = await apiGet('/triggers/audit-log');
  if (data.success) {
    renderSQL('trgSQL', data.sql);
    renderTable('trgResults', data.results);
    renderExplanation('trgExplanation', 'Shows the PROMISE_AUDIT_LOG populated by triggers.', [
      'Each row represents a status change event',
      'Automatically populated by trg_log_status_change trigger',
      'Records old status, new status, who changed it, and when'
    ]);
  }
}

document.addEventListener('DOMContentLoaded', initTriggers);
