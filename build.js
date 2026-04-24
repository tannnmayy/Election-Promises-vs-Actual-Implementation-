const { execSync } = require('child_process');
const fs = require('fs');

// Get old HTML and old CSS directly from git (UTF-8)
const oldHtml = execSync('git show 9cbe73e:frontend/index.html', { encoding: 'utf8' });
const oldCss = execSync('git show 9cbe73e:frontend/style.css', { encoding: 'utf8' });
const lightHtml = execSync('git show HEAD:frontend/index.html', { encoding: 'utf8' });

const dbStart = lightHtml.indexOf('<div class="app-layout">');
const dbEnd = lightHtml.indexOf('</div><!-- end content-body -->') + '</div><!-- end content-body -->'.length + '\n  </main>\n</div>'.length;
let dbContent = lightHtml.substring(dbStart, dbEnd);

// Wrap dbContent in a section
dbContent = '\n    <!-- ═══════════════ Database Tab ═══════════════ -->\n    <section class="section" id="database" style="display:none;">\n      ' + dbContent + '\n    </section>\n';

// Replace the CSS link in oldHtml from style.css to css/styles.css
let newHtml = oldHtml.replace('href="style.css"', 'href="css/styles.css"');

// Add ChartJS
newHtml = newHtml.replace('</head>', '  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>\n</head>');

// Insert Database tab link in navbar
newHtml = newHtml.replace('<li><a href="#governments" class="navbar__link">Governments</a></li>', 
  '<li><a href="#database" class="navbar__link">Database</a></li>\n        <li><a href="#governments" class="navbar__link">Governments</a></li>');

// Insert Database tab content before </main>
newHtml = newHtml.replace('  </main>', dbContent + '\n  </main>');

// Replace scripts
const scripts = '<script src="js/dashboard.js"></script>\n<script src="js/api.js"></script>\n<script src="js/visualizations.js"></script>\n<script src="js/main.js"></script>\n<script src="js/chapters/aggregate.js"></script>\n<script src="js/chapters/subqueries.js"></script>\n<script src="js/chapters/joins.js"></script>\n<script src="js/chapters/set_operations.js"></script>\n<script src="js/chapters/views.js"></script>\n<script src="js/chapters/functions.js"></script>\n<script src="js/chapters/procedures.js"></script>\n<script src="js/chapters/triggers.js"></script>\n<script src="js/chapters/cursors.js"></script>\n<script src="js/chapters/normalization.js"></script>\n<script src="js/chapters/concurrency.js"></script>';
newHtml = newHtml.replace('<script src="script.js"></script>', scripts);

// Save index.html
fs.writeFileSync('frontend/index.html', newHtml, 'utf8');

// Now we need to create the final CSS. It should be oldCss + the database tab styles.
const dbTabCss = `
/* ─── Database Tab (Dark Mode Adapted) ────────────────────── */
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--bg-glass-border);
  position: fixed;
  top: 70px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.sidebar-brand {
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--bg-glass-border);
}

.sidebar-brand h1 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.sidebar-brand .subtitle {
  font-size: 0.73rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 2px;
  text-transform: uppercase;
}

.sidebar-status {
  padding: 10px 20px;
  border-bottom: 1px solid var(--bg-glass-border);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}
.status-dot.connected { background: var(--accent-emerald); box-shadow: var(--shadow-glow-emerald); }
.status-dot.disconnected { background: var(--accent-rose); }

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  border-left: 3px solid transparent;
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-blue);
  border-left-color: var(--accent-blue);
  font-weight: 600;
}

.nav-item .nav-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-item .nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  background: var(--bg-primary);
}

.content-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--bg-glass-border);
  padding: 16px 32px;
  position: sticky;
  top: 70px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.content-header .concept-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-cyan);
  background: rgba(6, 182, 212, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.content-body {
  padding: 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.chapter { display: none; }
.chapter.active { display: block; }
.chapter-description { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px; line-height: 1.7; max-width: 800px; }

.sql-display {
  background: #0f172a;
  border: 1px solid var(--bg-glass-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin: 16px 0;
  overflow-x: auto;
  position: relative;
}

.sql-display pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.7;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.sql-display .keyword { color: #cba6f7; font-weight: 500; }
.sql-display .function { color: #89b4fa; }
.sql-display .string { color: #a6e3a1; }
.sql-display .number { color: #fab387; }
.sql-display .comment { color: #6c7086; font-style: italic; }
.sql-display .operator { color: #89dceb; }

.sql-label { font-size: 0.7rem; font-weight: 600; color: #6c7086; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }

.query-selector { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.query-selector label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); }
.query-dropdown {
  flex: 1;
  min-width: 250px;
  padding: 8px 12px;
  border: 1px solid var(--bg-glass-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--text-primary);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: border-color var(--transition-base);
}
.query-dropdown:focus { outline: none; border-color: var(--accent-blue); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; font-family: var(--font-body); font-size: 0.82rem; font-weight: 600; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition-base);
}
.btn-primary { background: var(--accent-blue); color: white; }
.btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.result-meta {
  display: flex; align-items: center; gap: 16px; padding: 8px 0; font-size: 0.75rem; color: var(--text-muted); border-bottom: 1px solid var(--bg-glass-border); margin-bottom: 8px;
}

.explanation-box {
  background: var(--bg-card);
  border: 1px solid var(--bg-glass-border);
  border-left: 4px solid var(--accent-blue);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  margin: 16px 0;
}
.explanation-box h4 { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.explanation-box p, .explanation-box li { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.7; }
.explanation-box ul { padding-left: 20px; margin-top: 8px; }

.learning-notes {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-left: 4px solid var(--accent-emerald);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  margin: 16px 0;
}
.learning-notes h4 { font-size: 0.85rem; font-weight: 700; color: var(--accent-emerald); margin-bottom: 8px; }

.form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
.form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--bg-glass-border); border-radius: var(--radius-sm); background: var(--bg-secondary); color: var(--text-primary); font-family: var(--font-body); font-size: 0.85rem; transition: border-color var(--transition-base); }
.form-input:focus { outline: none; border-color: var(--accent-blue); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.form-row .form-group { flex: 1; min-width: 150px; }

.norm-step {
  border: 1px solid var(--bg-glass-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
  background: var(--bg-card);
}
.norm-step h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
.norm-step .check-pass { color: var(--accent-emerald); font-weight: 600; }
.norm-step .check-fail { color: var(--accent-rose); font-weight: 600; }
.highlight-problem { background: rgba(244, 63, 94, 0.2) !important; color: #fb7185 !important; font-weight: 600; }
.highlight-pk { background: rgba(245, 158, 11, 0.15) !important; font-weight: 700; color: var(--accent-amber) !important; }
.highlight-fk { background: rgba(6, 182, 212, 0.15) !important; color: var(--accent-cyan) !important; font-weight: 600; }

.table-card-label { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; padding: 6px 12px; background: var(--bg-secondary); border-radius: var(--radius-sm) var(--radius-sm) 0 0; border: 1px solid var(--bg-glass-border); border-bottom: none; }
.dependency-arrow { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; padding: 6px 12px; border-radius: var(--radius-sm); margin: 4px 0; }
.dependency-arrow.good { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.dependency-arrow.bad { background: rgba(244, 63, 94, 0.1); color: #fb7185; }
.dependency-arrow.transitive { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }

.session-panel { border: 1px solid var(--bg-glass-border); border-radius: var(--radius-lg); overflow: hidden; background: var(--bg-card); }
.session-panel-header { background: var(--bg-secondary); padding: 10px 16px; font-weight: 700; font-size: 0.85rem; color: var(--text-primary); border-bottom: 1px solid var(--bg-glass-border); }
.session-panel-body { padding: 16px; }
.session-panel textarea { width: 100%; min-height: 100px; padding: 12px; font-family: var(--font-mono); font-size: 0.8rem; border: 1px solid var(--bg-glass-border); border-radius: var(--radius-sm); background: #0f172a; color: #e2e8f0; resize: vertical; line-height: 1.6; }

.step-number { width: 26px; height: 26px; border-radius: 50%; background: var(--accent-blue); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
.step-number.success { background: var(--accent-emerald); }
.step-number.error { background: var(--accent-rose); }
.steps-list { list-style: none; padding: 0; }
.steps-list li { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--bg-glass-border); font-size: 0.82rem; color: var(--text-secondary); }
.steps-list li:last-child { border-bottom: none; }
`;

fs.writeFileSync('frontend/css/styles.css', oldCss + '\n' + dbTabCss, 'utf8');
console.log('HTML and CSS correctly rebuilt in UTF-8');
