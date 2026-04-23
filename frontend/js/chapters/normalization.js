// ============================================================
// Chapter: Normalization (MOST INTERACTIVE)
// ============================================================

function initNormalization() {
  document.getElementById('normDenormalized')?.addEventListener('click', showDenormalized);
  document.getElementById('normRedundancy')?.addEventListener('click', showRedundancy);
  document.getElementById('normTableSelect')?.addEventListener('change', analyzeTable);
  document.getElementById('normAnalyze')?.addEventListener('click', analyzeTable);
  renderNormalizationSteps();
}

function renderNormalizationSteps() {
  const container = document.getElementById('normSteps');
  if (!container) return;
  container.innerHTML = `
    <!-- Step 0: Denormalized -->
    <div class="norm-step">
      <h3>⚠️ Before: Denormalized Table (Problems)</h3>
      <p style="margin-bottom:12px;font-size:0.85rem;color:#757575">If we stored everything in ONE table, we'd have these problems:</p>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr>
            <th>Promise_ID</th><th>Title</th>
            <th class="highlight-problem">Party_Name ❌</th>
            <th class="highlight-problem">Chief_Minister ❌</th>
            <th class="highlight-problem">Area_Name ❌</th>
            <th>Budget</th><th class="highlight-problem">Status ❌</th>
          </tr></thead>
          <tbody>
            <tr><td>1</td><td>Universal Healthcare</td><td class="highlight-problem">Progressive Party</td><td class="highlight-problem">Rajesh Kumar</td><td class="highlight-problem">Healthcare</td><td>₹5 Cr</td><td class="highlight-problem">In Progress</td></tr>
            <tr><td>2</td><td>Digital Education</td><td class="highlight-problem">Progressive Party</td><td class="highlight-problem">Rajesh Kumar</td><td class="highlight-problem">Education</td><td>₹2.5 Cr</td><td class="highlight-problem">Completed</td></tr>
            <tr><td>3</td><td>Metro Rail Expansion</td><td class="highlight-problem">People's Alliance</td><td class="highlight-problem">Priya Sharma</td><td class="highlight-problem">Infrastructure</td><td>₹15 Cr</td><td class="highlight-problem">In Progress</td></tr>
            <tr><td>4</td><td>Farmer Income Doubling</td><td class="highlight-problem">Progressive Party</td><td class="highlight-problem">Rajesh Kumar</td><td class="highlight-problem">Agriculture</td><td>₹7.5 Cr</td><td class="highlight-problem">Completed</td></tr>
          </tbody>
        </table>
      </div>
      <div class="explanation-box" style="margin-top:16px;border-left-color:var(--red)">
        <h4>⚠️ Anomalies in Denormalized Design</h4>
        <ul>
          <li><strong>Update Anomaly:</strong> Changing "Rajesh Kumar" requires updating rows 1, 2, and 4. Missing one creates inconsistency.</li>
          <li><strong>Deletion Anomaly:</strong> Deleting promise 3 would lose all info about "People's Alliance" and "Priya Sharma".</li>
          <li><strong>Insertion Anomaly:</strong> Cannot add a new government without first adding a promise.</li>
          <li><strong>Redundancy:</strong> "Progressive Party" + "Rajesh Kumar" stored 3 times instead of once.</li>
        </ul>
      </div>
    </div>

    <!-- Step 1: 1NF -->
    <div class="norm-step">
      <h3>✅ Step 1: First Normal Form (1NF)</h3>
      <div class="learning-notes">
        <h4>1NF Requirements</h4>
        <ul>
          <li>✅ Each column contains <strong>atomic</strong> (single, indivisible) values</li>
          <li>✅ No repeating groups or arrays in any column</li>
          <li>✅ Each row is unique — has a <strong>Primary Key</strong></li>
          <li>✅ Each column has a single data type</li>
        </ul>
      </div>
      <p style="margin-top:12px" class="check-pass">✅ Our table satisfies 1NF — all values are atomic, Promise_ID is the PK.</p>
    </div>

    <!-- Step 2: 2NF -->
    <div class="norm-step">
      <h3>⚠️ Step 2: Second Normal Form (2NF)</h3>
      <div class="learning-notes">
        <h4>2NF Requirements</h4>
        <ul>
          <li>✅ Must already be in 1NF</li>
          <li>⚠️ No <strong>partial dependencies</strong> — every non-key attribute must depend on the <strong>entire</strong> primary key</li>
        </ul>
      </div>
      <h4 style="margin:16px 0 8px;color:var(--navy)">Dependency Analysis:</h4>
      <div class="dependency-arrow good">✅ Promise_ID → Title (full dependency on PK)</div>
      <div class="dependency-arrow good">✅ Promise_ID → Budget (full dependency on PK)</div>
      <div class="dependency-arrow good">✅ Promise_ID → Description (full dependency on PK)</div>
      <div class="dependency-arrow transitive">⚠️ Promise_ID → Govt_ID → Party_Name (transitive!)</div>
      <div class="dependency-arrow transitive">⚠️ Promise_ID → Govt_ID → Chief_Minister (transitive!)</div>
      <div class="dependency-arrow transitive">⚠️ Promise_ID → PolicyArea_ID → Area_Name (transitive!)</div>
      <p style="margin-top:12px;font-size:0.85rem">With a single-column PK, there are no <em>partial</em> dependencies. But transitive dependencies remain → need 3NF.</p>
    </div>

    <!-- Step 3: 3NF -->
    <div class="norm-step">
      <h3>✅ Step 3: Third Normal Form (3NF) — Our Design</h3>
      <div class="learning-notes">
        <h4>3NF Requirements</h4>
        <ul>
          <li>✅ Must be in 2NF</li>
          <li>✅ No <strong>transitive dependencies</strong> — non-key attributes depend ONLY on the primary key</li>
        </ul>
      </div>
      <h4 style="margin:16px 0 8px;color:var(--navy)">Solution: Separate Tables (our actual schema)</h4>
      <div class="tables-side-by-side">
        <div>
          <div class="table-card-label">🔑 GOVERNMENT Table</div>
          <div class="table-wrapper" style="margin-top:0">
            <table class="data-table">
              <thead><tr><th class="highlight-pk">Govt_ID (PK)</th><th>Party_Name</th><th>Chief_Minister</th></tr></thead>
              <tbody>
                <tr><td class="highlight-pk">1</td><td>Progressive Party</td><td>Rajesh Kumar</td></tr>
                <tr><td class="highlight-pk">2</td><td>People's Alliance</td><td>Priya Sharma</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="table-card-label">🔑 POLICY_AREA Table</div>
          <div class="table-wrapper" style="margin-top:0">
            <table class="data-table">
              <thead><tr><th class="highlight-pk">PolicyArea_ID (PK)</th><th>Area_Name</th></tr></thead>
              <tbody>
                <tr><td class="highlight-pk">1</td><td>Healthcare</td></tr>
                <tr><td class="highlight-pk">2</td><td>Education</td></tr>
                <tr><td class="highlight-pk">3</td><td>Infrastructure</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="table-card-label">🔑 PROMISE Table (clean!)</div>
          <div class="table-wrapper" style="margin-top:0">
            <table class="data-table">
              <thead><tr><th class="highlight-pk">Promise_ID (PK)</th><th>Title</th><th class="highlight-fk">Govt_ID (FK)</th><th class="highlight-fk">PolicyArea_ID (FK)</th><th>Budget</th></tr></thead>
              <tbody>
                <tr><td class="highlight-pk">1</td><td>Universal Healthcare</td><td class="highlight-fk">1</td><td class="highlight-fk">1</td><td>₹5 Cr</td></tr>
                <tr><td class="highlight-pk">2</td><td>Digital Education</td><td class="highlight-fk">1</td><td class="highlight-fk">2</td><td>₹2.5 Cr</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="explanation-box" style="border-left-color:var(--green)">
        <h4>✅ Benefits of 3NF Design</h4>
        <ul>
          <li>✅ <strong>No update anomalies:</strong> Change CM name once in GOVERNMENT table</li>
          <li>✅ <strong>No deletion anomalies:</strong> Delete promises without losing government data</li>
          <li>✅ <strong>No insertion anomalies:</strong> Add governments without needing a promise</li>
          <li>✅ <strong>Minimal redundancy:</strong> Each fact stored exactly once</li>
          <li>✅ <strong>Referential integrity:</strong> Foreign keys enforce valid relationships</li>
        </ul>
      </div>
    </div>
  `;
}

async function showDenormalized() {
  showLoading('normResults');
  const data = await apiGet('/normalization/denormalized-example');
  if (data.success) {
    renderTable('normResults', data.results.denormalized);
    renderExplanation('normExplanation', data.explanation, [
      'This is a JOIN of all related tables into one flat result',
      'Notice: Party_Name and Chief_Minister repeat for every promise',
      'In a truly denormalized table, this redundancy wastes storage and causes anomalies'
    ]);
  }
}

async function showRedundancy() {
  showLoading('normResults');
  const data = await apiGet('/normalization/redundancy-check');
  if (data.success) {
    let html = '<h4 style="margin:0 0 8px;color:#1a237e">Normalized (stored once)</h4><div id="normNorm"></div>';
    html += '<h4 style="margin:16px 0 8px;color:#1a237e">Denormalized (redundant copies)</h4><div id="normDenorm"></div>';
    document.getElementById('normResults').innerHTML = html;
    renderTable('normNorm', data.results.normalized);
    renderTable('normDenorm', data.results.denormalized);
    renderExplanation('normExplanation', data.explanation, [
      'In normalized design: each government stored ONCE',
      'In denormalized design: government info repeated per promise (2-3x)',
      'Normalization eliminates this redundancy'
    ]);
  }
}

async function analyzeTable() {
  const tableName = document.getElementById('normTableSelect')?.value || 'PROMISE';
  showLoading('normResults');
  const data = await apiGet(`/normalization/dependencies/${tableName}`);
  if (data.success) {
    let html = `<h4 style="margin:0 0 8px;color:#1a237e">Columns of ${tableName}</h4><div id="normCols"></div>`;
    html += `<h4 style="margin:16px 0 8px;color:#1a237e">Foreign Key Relationships</h4><div id="normFKs"></div>`;
    document.getElementById('normResults').innerHTML = html;
    renderTable('normCols', data.results.columns);
    if (data.results.foreignKeys.length > 0) {
      renderTable('normFKs', data.results.foreignKeys);
    } else {
      document.getElementById('normFKs').innerHTML = '<div class="empty-state">No foreign keys (this is a parent/reference table)</div>';
    }
    renderExplanation('normExplanation', data.explanation, [
      'Columns with Key = "PRI" are primary keys',
      'Columns with Key = "MUL" have indexes (often foreign keys)',
      'Foreign keys link this table to parent tables, maintaining referential integrity'
    ]);
  }
}

document.addEventListener('DOMContentLoaded', initNormalization);
