// ============================================================
// Main Application Controller
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHealthCheck();
  initMobileToggle();
});

// ─── Navigation ──────────────────────────────────────────────
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const chapterId = item.dataset.chapter;
      switchChapter(chapterId);
    });
  });
  // Activate first chapter
  switchChapter('aggregate');
}

function switchChapter(chapterId) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-chapter="${chapterId}"]`);
  if (activeNav) activeNav.classList.add('active');

  // Update chapters
  document.querySelectorAll('.chapter').forEach(c => c.classList.remove('active'));
  const activeChapter = document.getElementById(`chapter-${chapterId}`);
  if (activeChapter) activeChapter.classList.add('active');

  // Update header
  const headerTitle = document.getElementById('headerTitle');
  const headerTag = document.getElementById('headerTag');
  if (activeNav && headerTitle) {
    headerTitle.textContent = activeNav.querySelector('.nav-label').textContent;
  }
  const tags = {
    aggregate: 'COUNT, SUM, AVG, MIN, MAX',
    subqueries: 'Scalar, Correlated, EXISTS',
    joins: 'INNER, LEFT, RIGHT, CROSS, SELF',
    sets: 'UNION, INTERSECT, EXCEPT',
    views: 'CREATE VIEW, Virtual Tables',
    functions: 'CREATE FUNCTION, RETURNS',
    procedures: 'CALL, IN/OUT Parameters',
    triggers: 'BEFORE/AFTER, Audit Logging',
    cursors: 'DECLARE, FETCH, LOOP',
    normalization: '1NF → 2NF → 3NF',
    concurrency: 'Transactions, Isolation, Locks'
  };
  if (headerTag) headerTag.textContent = tags[chapterId] || '';

  // Close mobile sidebar
  document.querySelector('.sidebar')?.classList.remove('open');
}

// ─── Health Check ────────────────────────────────────────────
async function initHealthCheck() {
  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  try {
    const data = await checkHealth();
    if (data.status === 'connected') {
      dot?.classList.add('connected');
      dot?.classList.remove('disconnected');
      if (label) label.textContent = 'Database Connected';
    } else {
      dot?.classList.add('disconnected');
      dot?.classList.remove('connected');
      if (label) label.textContent = 'Disconnected';
    }
  } catch {
    dot?.classList.add('disconnected');
    if (label) label.textContent = 'Disconnected';
  }
}

// ─── Mobile Toggle ───────────────────────────────────────────
function initMobileToggle() {
  const toggle = document.getElementById('mobileToggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

// ─── Utility: Render data as HTML table ──────────────────────
function renderTable(containerId, rows, highlightColumns = []) {
  const container = document.getElementById(containerId);
  if (!container || !rows || rows.length === 0) {
    if (container) container.innerHTML = '<div class="empty-state"><div class="icon">📭</div>No results returned</div>';
    return;
  }
  const cols = Object.keys(rows[0]);
  let html = '<div class="table-wrapper"><table class="data-table"><thead><tr>';
  cols.forEach(c => {
    const cls = highlightColumns.includes(c) ? ' class="highlight-pk"' : '';
    html += `<th${cls}>${c}</th>`;
  });
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>';
    cols.forEach(c => {
      let val = row[c];
      if (val === null || val === undefined) val = '<span style="color:#bbb">NULL</span>';
      else if (typeof val === 'number') val = val.toLocaleString();
      // Badge for status columns
      if (c === 'Status_Type' || c === 'Category') {
        val = statusBadge(row[c]);
      }
      const cls = highlightColumns.includes(c) ? ' class="highlight-pk"' : '';
      html += `<td${cls}>${val}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function statusBadge(status) {
  if (!status) return '';
  const map = {
    'Completed': 'badge-completed',
    'In Progress': 'badge-inprogress',
    'Delayed': 'badge-delayed',
    'Abandoned': 'badge-abandoned',
    'Not Started': 'badge-notstarted',
    'Excellent': 'badge-completed',
    'Good': 'badge-completed',
    'Average': 'badge-inprogress',
    'Poor': 'badge-delayed',
    'Critical': 'badge-abandoned'
  };
  const cls = map[status] || '';
  return `<span class="badge ${cls}">${status}</span>`;
}

// ─── Utility: Show SQL with basic syntax highlighting ────────
function renderSQL(containerId, sql) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const highlighted = highlightSQL(sql.trim());
  container.innerHTML = `<div class="sql-display"><div class="sql-label">SQL Query</div><pre>${highlighted}</pre></div>`;
}

function highlightSQL(sql) {
  const keywords = ['SELECT','FROM','WHERE','JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN','CROSS JOIN','ON','AND','OR','NOT','IN','EXISTS','GROUP BY','ORDER BY','HAVING','LIMIT','AS','DISTINCT','UNION','UNION ALL','INSERT','UPDATE','DELETE','SET','VALUES','INTO','CREATE','DROP','ALTER','TABLE','VIEW','FUNCTION','PROCEDURE','TRIGGER','CURSOR','CALL','CASE','WHEN','THEN','ELSE','END','IF','BETWEEN','LIKE','IS','NULL','DESC','ASC','START TRANSACTION','COMMIT','ROLLBACK','SAVEPOINT','BEGIN','DECLARE','RETURNS','RETURN','ROUND','COUNT','SUM','AVG','MIN','MAX','CONCAT','COALESCE','DATEDIFF','YEAR','CURDATE','NOW','REPLACE','FOREIGN KEY','PRIMARY KEY','REFERENCES','INDEX','SHOW','DESCRIBE','NOT IN','LEFT','RIGHT'];
  let result = sql
    .replace(/--.*$/gm, m => `<span class="comment">${m}</span>`)
    .replace(/'[^']*'/g, m => `<span class="string">${m}</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
  keywords.sort((a, b) => b.length - a.length);
  keywords.forEach(kw => {
    const re = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi');
    result = result.replace(re, m => `<span class="keyword">${m}</span>`);
  });
  return result;
}

// ─── Utility: Show loading state ─────────────────────────────
function showLoading(containerId) {
  const c = document.getElementById(containerId);
  if (c) c.innerHTML = '<div class="loading-overlay"><span class="spinner"></span> Executing query...</div>';
}

// ─── Utility: Show explanation ───────────────────────────────
function renderExplanation(containerId, explanation, concepts) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = `<div class="explanation-box"><h4>📚 What This Query Does</h4><p>${explanation}</p>`;
  if (concepts && concepts.length > 0) {
    html += '<h4 style="margin-top:12px">💡 Key Concepts</h4><ul class="concept-list">';
    concepts.forEach(c => { html += `<li>${c}</li>`; });
    html += '</ul>';
  }
  html += '</div>';
  container.innerHTML = html;
}

// ─── Utility: Show result metadata ───────────────────────────
function renderMeta(containerId, metadata) {
  const c = document.getElementById(containerId);
  if (!c || !metadata) return;
  c.innerHTML = `<div class="result-meta"><span>📊 <strong>${metadata.rowCount || 0}</strong> rows</span><span>⏱ ${metadata.executionTime || '-'}</span><span>📝 ${metadata.concept || ''}</span></div>`;
}
