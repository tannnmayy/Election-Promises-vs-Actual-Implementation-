// ============================================================
// Chapter: Stored Functions
// ============================================================

function initFunctions() {
  document.getElementById('fnFulfillment')?.addEventListener('click', testFulfillmentRate);
  document.getElementById('fnStatus')?.addEventListener('click', testStatusCategory);
  document.getElementById('fnEfficiency')?.addEventListener('click', testBudgetEfficiency);
  document.getElementById('fnAllFunctions')?.addEventListener('click', testAllFunctions);
}

async function testFulfillmentRate() {
  const govtId = document.getElementById('fnGovtId')?.value || 1;
  showLoading('fnResults');
  const data = await apiPost('/functions/fulfillment-rate', { govt_id: govtId });
  if (data.success) {
    renderSQL('fnSQL', data.sql);
    renderTable('fnResults', data.results);
    renderExplanation('fnExplanation', data.explanation, [
      '<strong>CREATE FUNCTION:</strong> Defines reusable SQL function',
      '<strong>RETURNS DECIMAL(5,2):</strong> Specifies return type',
      '<strong>READS SQL DATA:</strong> Function reads but doesn\'t modify data',
      'Uses DECLARE, IF/THEN, SELECT INTO internally'
    ]);
  }
}

async function testStatusCategory() {
  const progress = document.getElementById('fnProgress')?.value || 50;
  showLoading('fnResults');
  const data = await apiPost('/functions/status-category', { progress });
  if (data.success) {
    renderSQL('fnSQL', data.sql);
    renderTable('fnResults', data.results);
    renderExplanation('fnExplanation', data.explanation, [
      '<strong>Deterministic function:</strong> Same input always returns same output',
      '<strong>NO SQL:</strong> Function uses no SQL statements',
      'Uses IF/ELSEIF/ELSE for classification logic'
    ]);
  }
}

async function testBudgetEfficiency() {
  const promiseId = document.getElementById('fnPromiseId')?.value || 1;
  showLoading('fnResults');
  const data = await apiPost('/functions/budget-efficiency', { promise_id: promiseId });
  if (data.success) {
    renderSQL('fnSQL', data.sql);
    renderTable('fnResults', data.results);
    renderExplanation('fnExplanation', data.explanation, [
      'Calculates progress achieved per million spent',
      'Uses SELECT INTO to fetch budget and progress',
      'Handles NULL/zero budget with IF check'
    ]);
  }
}

async function testAllFunctions() {
  showLoading('fnResults');
  const data = await apiGet('/functions/all-with-functions');
  if (data.success) {
    renderSQL('fnSQL', data.sql);
    renderTable('fnResults', data.results);
    renderExplanation('fnExplanation', data.explanation, [
      'Functions used directly in SELECT clause',
      'Each row computed dynamically via function calls'
    ]);
  }
}

document.addEventListener('DOMContentLoaded', initFunctions);
