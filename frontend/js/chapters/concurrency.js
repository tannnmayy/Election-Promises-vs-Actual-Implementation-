// ============================================================
// Chapter: Concurrency Control
// ============================================================

function initConcurrency() {
  document.getElementById('ccTransaction')?.addEventListener('click', executeTransaction);
  document.getElementById('ccSavepoint')?.addEventListener('click', executeSavepoint);
  document.getElementById('ccIsolation')?.addEventListener('click', testIsolation);
  document.getElementById('ccLocks')?.addEventListener('click', showLocks);
}

async function executeTransaction() {
  const promise_id = document.getElementById('ccPromiseId')?.value || 1;
  const budget = document.getElementById('ccBudget')?.value || 55000000;
  const progress = document.getElementById('ccProgress')?.value || 70;
  showLoading('ccResults');
  const data = await apiPost('/concurrency/transaction', { promise_id, budget, progress });
  renderSQL('ccSQL', data.sql || 'START TRANSACTION; ... COMMIT;');
  if (data.success) {
    renderTransactionSteps('ccResults', data.results);
    renderExplanation('ccExplanation', 'Demonstrates a complete transaction lifecycle.', [
      '<strong>ACID Properties:</strong> Atomicity, Consistency, Isolation, Durability',
      '<strong>START TRANSACTION:</strong> Begins a new transaction',
      '<strong>COMMIT:</strong> Permanently saves all changes',
      '<strong>ROLLBACK:</strong> Undoes all changes if an error occurs',
      'All statements between START and COMMIT are atomic'
    ]);
  } else {
    document.getElementById('ccResults').innerHTML = `<div class="empty-state">❌ ${data.error}</div>`;
  }
}

async function executeSavepoint() {
  showLoading('ccResults');
  const data = await apiPost('/concurrency/savepoint-demo');
  renderSQL('ccSQL', data.sql || 'START TRANSACTION; ... SAVEPOINT sp1; ... ROLLBACK TO sp1; ... COMMIT;');
  if (data.success) {
    renderTransactionSteps('ccResults', data.results);
    renderExplanation('ccExplanation', 'Demonstrates SAVEPOINT for partial rollbacks.', [
      '<strong>SAVEPOINT name:</strong> Creates a named checkpoint within a transaction',
      '<strong>ROLLBACK TO name:</strong> Undoes changes back to the savepoint',
      'Changes before the savepoint are preserved',
      'Useful for complex transactions where only part may fail'
    ]);
  }
}

async function testIsolation() {
  const level = document.getElementById('ccIsolationLevel')?.value || 'REPEATABLE READ';
  showLoading('ccResults');
  const data = await apiPost(`/concurrency/test-isolation/${encodeURIComponent(level)}`);
  if (data.success) {
    renderSQL('ccSQL', data.sql);
    renderTable('ccResults', Array.isArray(data.results) ? data.results : [data.results]);
    renderExplanation('ccExplanation', data.explanation, [
      '<strong>READ UNCOMMITTED:</strong> Dirty reads possible (see uncommitted data)',
      '<strong>READ COMMITTED:</strong> Only sees committed data',
      '<strong>REPEATABLE READ:</strong> MySQL default — consistent reads within transaction',
      '<strong>SERIALIZABLE:</strong> Strictest — full table locking, prevents all anomalies',
      'Higher isolation = more safety, but lower concurrency'
    ]);
  }
}

async function showLocks() {
  showLoading('ccResults');
  const data = await apiGet('/concurrency/show-locks');
  if (data.success) {
    renderSQL('ccSQL', data.sql);
    if (data.results.length === 0) {
      document.getElementById('ccResults').innerHTML = '<div class="empty-state"><div class="icon">🔓</div>No active transactions holding locks</div>';
    } else {
      renderTable('ccResults', data.results);
    }
    renderExplanation('ccExplanation', data.explanation, [
      'Shows InnoDB transactions currently active',
      'Transactions holding locks will appear here',
      'Long-running transactions can cause lock contention'
    ]);
  }
}

function renderTransactionSteps(containerId, steps) {
  const container = document.getElementById(containerId);
  if (!container || !steps || !steps.length) return;
  let html = '<ol class="steps-list">';
  steps.forEach(step => {
    const isError = step.step === 'ERROR';
    const numClass = isError ? 'error' : (step.action?.includes('COMMIT') ? 'success' : '');
    html += `<li>
      <span class="step-number ${numClass}">${step.step}</span>
      <div>
        <strong>${step.action || ''}</strong>
        ${step.data ? `<div style="margin-top:4px;font-size:0.8rem;color:#757575">${typeof step.data === 'object' ? JSON.stringify(step.data) : step.data}</div>` : ''}
      </div>
    </li>`;
  });
  html += '</ol>';
  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initConcurrency);
