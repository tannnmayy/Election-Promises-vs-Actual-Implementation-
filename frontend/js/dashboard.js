document.addEventListener('DOMContentLoaded', () => {
  // ─── Navigation Logic (Single Page + Database Tab) ───────────
  const navLinks = document.querySelectorAll('.navbar__link');
  const mainContentSections = document.querySelectorAll('main > section:not(#database), .hero');
  const databaseSection = document.getElementById('database');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href').substring(1);
      
      // Update active state
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');

      if (targetId === 'database') {
        // Hide main dashboard, show database
        mainContentSections.forEach(sec => sec.style.display = 'none');
        if (databaseSection) databaseSection.style.display = 'block';
        
        // Ensure Database schema is rendered
        renderERDiagram();
      } else {
        // Show main dashboard, hide database
        mainContentSections.forEach(sec => sec.style.display = 'block');
        if (databaseSection) databaseSection.style.display = 'none';

        // Scroll to target section
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 70; // Header offset
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Helper to format currency
  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return '₹' + (val / 10000000).toFixed(1) + ' Cr';
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    const cls = status.replace(/\s+/g, '').toLowerCase();
    return `<span class="badge badge-${cls}">${status}</span>`;
  };

  // Global store for promises to allow filtering
  let allPromisesData = [];

  // ─── Fetch All Dashboard Data on Load ─────────────────────────
  async function loadDashboardData() {
    try {
      fetchOverviewData();
      fetchPromisesData();
      fetchGovernmentsData();
      fetchAnalyticsData();
      fetchOutcomesData();
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  }

  async function fetchOverviewData() {
    try {
      const countRes = await fetch('/api/aggregate/count-by-status').then(r => r.json());
      const budgetRes = await fetch('/api/aggregate/budget-by-area').then(r => r.json());
      
      if (!countRes.success) throw new Error(countRes.error);
      
      const statusData = countRes.results || [];
      const totalPromises = statusData.reduce((acc, row) => acc + row.Total_Promises, 0);
      const completedPromises = statusData.find(r => r.Status_Type === 'Completed')?.Total_Promises || 0;
      const inProgressPromises = statusData.find(r => r.Status_Type === 'In Progress')?.Total_Promises || 0;
      
      const completionRate = totalPromises > 0 ? ((completedPromises / totalPromises) * 100).toFixed(1) : 0;
      
      const budgetData = budgetRes.results || [];
      const totalBudget = budgetData.reduce((acc, row) => acc + parseFloat(row.Total_Budget), 0);

      document.getElementById('kpiGrid').innerHTML = `
        <div class="kpi-card animate-in">
          <div class="kpi-card__icon" style="background: rgba(118, 185, 0, 0.2); color: var(--accent-green);">🎯</div>
          <div class="kpi-card__info">
            <div class="kpi-card__value">${totalPromises}</div>
            <div class="kpi-card__label">Total Promises</div>
          </div>
        </div>
        <div class="kpi-card animate-in">
          <div class="kpi-card__icon" style="background: rgba(118, 185, 0, 0.2); color: var(--accent-green);">✅</div>
          <div class="kpi-card__info">
            <div class="kpi-card__value">${completionRate}%</div>
            <div class="kpi-card__label">Completion Rate</div>
          </div>
        </div>
        <div class="kpi-card animate-in">
          <div class="kpi-card__icon" style="background: rgba(118, 185, 0, 0.2); color: var(--accent-green);">💰</div>
          <div class="kpi-card__info">
            <div class="kpi-card__value">${formatCurrency(totalBudget)}</div>
            <div class="kpi-card__label">Total Budget</div>
          </div>
        </div>
        <div class="kpi-card animate-in">
          <div class="kpi-card__icon" style="background: rgba(118, 185, 0, 0.2); color: var(--accent-green);">⏳</div>
          <div class="kpi-card__info">
            <div class="kpi-card__value">${inProgressPromises}</div>
            <div class="kpi-card__label">In Progress</div>
          </div>
        </div>
      `;
    } catch (err) {
      document.getElementById('kpiGrid').innerHTML = `<div class="empty-state">Failed to load metrics: ${err.message}</div>`;
    }
  }

  async function fetchPromisesData() {
    try {
      const res = await fetch('/api/joins/promise-details').then(r => r.json());
      if (!res.success) throw new Error(res.error);
      
      allPromisesData = res.results || [];
      renderPromisesTable(allPromisesData);
    } catch (err) {
      document.getElementById('promiseTableBody').innerHTML = `<tr><td colspan="7" class="empty-state">Error: ${err.message}</td></tr>`;
    }
  }

  function renderPromisesTable(data) {
    let html = '';
    if (data.length === 0) {
      html = `<tr><td colspan="7" class="empty-state">No promises found.</td></tr>`;
    } else {
      data.forEach(row => {
        html += `
          <tr>
            <td style="font-weight:600;color:var(--text-primary)">${row.Promise}</td>
            <td>${row.Party_Name}</td>
            <td>${row.Policy_Area}</td>
            <td>${getStatusBadge(row.Status_Type)}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;background:var(--bg-glass-border);height:6px;border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${row.Progress_Percentage}%;background:var(--accent-green)"></div>
                </div>
                <span style="font-size:0.75rem;font-weight:600">${parseFloat(row.Progress_Percentage).toFixed(0)}%</span>
              </div>
            </td>
            <td style="font-weight:600;color:var(--accent-green)">${formatCurrency(row.Budget_Allocated)}</td>
            <td><span style="font-size:0.8rem;color:var(--text-secondary)">High</span></td>
          </tr>
        `;
      });
    }
    document.getElementById('promiseTableBody').innerHTML = html;
  }

  // Setup filtering for Promises
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.dataset.filter;
      if (filter === 'All') {
        renderPromisesTable(allPromisesData);
      } else {
        const filtered = allPromisesData.filter(p => p.Status_Type === filter);
        renderPromisesTable(filtered);
      }
    });
  });

  const searchInput = document.getElementById('tableSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const filter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'All';
      
      let filtered = allPromisesData;
      if (filter !== 'All') {
        filtered = filtered.filter(p => p.Status_Type === filter);
      }
      
      if (val) {
        filtered = filtered.filter(p => 
          p.Promise.toLowerCase().includes(val) || 
          p.Party_Name.toLowerCase().includes(val) || 
          p.Policy_Area.toLowerCase().includes(val)
        );
      }
      renderPromisesTable(filtered);
    });
  }

  async function fetchGovernmentsData() {
    try {
      const res = await fetch('/api/views/performance-scorecard').then(r => r.json());
      if (!res.success) throw new Error(res.error);
      
      const rows = res.results || [];
      let html = '';
      
      if (rows.length === 0) {
        html = `<div class="empty-state">No governments found.</div>`;
      } else {
        rows.forEach(row => {
          const logo = row.Party_Name.substring(0, 1);
          html += `
            <div class="scorecard animate-in">
              <div class="scorecard__header">
                <div class="scorecard__logo">${logo}</div>
                <div class="scorecard__title-group">
                  <h3 class="scorecard__title">${row.Party_Name}</h3>
                  <div class="scorecard__subtitle">Led by ${row.Chief_Minister} · ${row.Start_Year}</div>
                </div>
              </div>
              <div class="scorecard__stats">
                <div class="scorecard__stat">
                  <div class="scorecard__stat-value">${row.Total_Promises}</div>
                  <div class="scorecard__stat-label">Promises</div>
                </div>
                <div class="scorecard__stat">
                  <div class="scorecard__stat-value" style="color:var(--accent-emerald)">${row.Completed_Promises}</div>
                  <div class="scorecard__stat-label">Completed</div>
                </div>
                <div class="scorecard__stat">
                  <div class="scorecard__stat-value" style="color:var(--accent-amber)">${formatCurrency(row.Total_Budget_Allocated)}</div>
                  <div class="scorecard__stat-label">Budget</div>
                </div>
              </div>
              <div class="scorecard__progress">
                <div class="scorecard__progress-label">
                  <span>Overall Progress</span>
                  <span style="color:var(--text-primary);font-weight:700">${parseFloat(row.Completion_Rate).toFixed(1)}%</span>
                </div>
                <div class="scorecard__progress-bar">
                  <div class="scorecard__progress-fill" style="width: ${row.Completion_Rate}%; background: var(--gradient-primary)"></div>
                </div>
              </div>
            </div>
          `;
        });
      }
      
      document.getElementById('scorecardGrid').innerHTML = html;
    } catch (err) {
      document.getElementById('scorecardGrid').innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    }
  }

  async function fetchAnalyticsData() {
    try {
      const [budgetRes, statusRes] = await Promise.all([
        fetch('/api/aggregate/budget-by-area').then(r => r.json()),
        fetch('/api/aggregate/count-by-status').then(r => r.json())
      ]);
      
      if (budgetRes.success && budgetRes.results.length > 0) {
        const labels = budgetRes.results.map(r => r.Area_Name);
        const data = budgetRes.results.map(r => r.Total_Budget);
        
        const container = document.getElementById('budgetChart');
        container.style.position = 'relative';
        container.style.height = '300px';
        if(container.tagName !== 'CANVAS') {
           const canvas = document.createElement('canvas');
           canvas.id = 'budgetAnalyticsChart';
           container.innerHTML = '';
           container.appendChild(canvas);
        }

        new Chart(document.getElementById('budgetAnalyticsChart') || container.querySelector('canvas'), {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Budget Allocated (INR)',
              data: data,
              backgroundColor: 'rgba(118, 185, 0, 0.7)',
              borderColor: 'rgba(118, 185, 0, 1)',
              borderWidth: 1,
              borderRadius: 4
            }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false,
            color: '#94a3b8',
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#e2e8f0' } } }
          }
        });
      }
      
      if (statusRes.success && statusRes.results.length > 0) {
        const labels = statusRes.results.map(r => r.Status_Type);
        const data = statusRes.results.map(r => r.Total_Promises);
        
        const container = document.getElementById('statusDonut');
        container.style.position = 'relative';
        container.style.height = '300px';
        if(container.tagName !== 'CANVAS') {
           const canvas = document.createElement('canvas');
           canvas.id = 'statusAnalyticsChart';
           container.innerHTML = '';
           container.appendChild(canvas);
        }

        new Chart(document.getElementById('statusAnalyticsChart') || container.querySelector('canvas'), {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: [
                '#76b900', // Completed (NVIDIA Green)
                '#5c9000', // In Progress (Dark Green)
                '#94a3b8', // Not Started (Gray)
                '#334155', // Delayed (Dark Gray)
                '#050505'  // Abandoned (Black)
              ],
              borderColor: '#111827',
              borderWidth: 2
            }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false,
            color: '#94a3b8',
            plugins: { legend: { position: 'right', labels: { color: '#e2e8f0', padding: 20 } } }
          }
        });
      }
    } catch (err) {
      console.error("Failed to load analytics charts", err);
    }
  }

  async function fetchOutcomesData() {
    try {
      const res = await fetch('/api/views/outcome-analysis').then(r => r.json());
      if (!res.success) throw new Error(res.error);
      
      const rows = res.results || [];
      let html = '';
      
      if (rows.length === 0) {
        html = `<div class="empty-state">No outcome data available.</div>`;
      } else {
        rows.forEach(row => {
          let achievementColor = 'var(--text-secondary)';
          const achievement = parseFloat(row.Target_Achievement_Percentage);
          if (achievement >= 90) achievementColor = 'var(--accent-green)';
          else if (achievement >= 50) achievementColor = 'var(--accent-green-light)';
          else if (achievement < 50) achievementColor = 'var(--text-muted)';

          html += `
            <div class="outcome-card animate-in">
              <div class="outcome-card__title">${row.Promise_Title}</div>
              <div class="outcome-card__indicator">${row.Party_Name} · ${row.Indicator_Name}</div>
              
              <div class="outcome-card__metrics">
                <div class="outcome-card__metric">
                  <div class="outcome-card__metric-value">${row.baseline_value}</div>
                  <div class="outcome-card__metric-label">Baseline</div>
                </div>
                <div class="outcome-card__metric">
                  <div class="outcome-card__metric-value">${row.target_value}</div>
                  <div class="outcome-card__metric-label">Target</div>
                </div>
                <div class="outcome-card__metric">
                  <div class="outcome-card__metric-value" style="color:var(--text-primary)">${row.Measured_Value}</div>
                  <div class="outcome-card__metric-label">Actual</div>
                </div>
              </div>
              
              <div class="outcome-card__achievement">
                <div class="outcome-card__achievement-value" style="color:${achievementColor}">${achievement}%</div>
                <div class="outcome-card__achievement-label">Target Achieved</div>
              </div>
            </div>
          `;
        });
      }
      
      document.getElementById('outcomeGrid').innerHTML = html;
    } catch (err) {
      document.getElementById('outcomeGrid').innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    }
  }

  function renderERDiagram() {
    const erHTML = `
      <div class="er-entity">
        <div class="er-entity__header">PROMISE</div>
        <ul class="er-entity__attrs">
          <li class="er-entity__attr er-entity__attr--pk">🔑 Promise_ID</li>
          <li class="er-entity__attr">• Title</li>
          <li class="er-entity__attr">• Description</li>
          <li class="er-entity__attr er-entity__attr--fk">🔗 Govt_ID</li>
          <li class="er-entity__attr er-entity__attr--fk">🔗 Area_ID</li>
          <li class="er-entity__attr">• Status</li>
        </ul>
      </div>
      <div class="er-entity">
        <div class="er-entity__header">GOVERNMENT</div>
        <ul class="er-entity__attrs">
          <li class="er-entity__attr er-entity__attr--pk">🔑 Govt_ID</li>
          <li class="er-entity__attr">• Party_Name</li>
          <li class="er-entity__attr">• Chief_Minister</li>
          <li class="er-entity__attr">• Start_Year</li>
        </ul>
      </div>
      <div class="er-entity">
        <div class="er-entity__header">POLICY_AREA</div>
        <ul class="er-entity__attrs">
          <li class="er-entity__attr er-entity__attr--pk">🔑 Area_ID</li>
          <li class="er-entity__attr">• Area_Name</li>
          <li class="er-entity__attr">• Total_Budget</li>
        </ul>
      </div>
      <div class="er-entity">
        <div class="er-entity__header">IMPLEMENTATION_STATUS</div>
        <ul class="er-entity__attrs">
          <li class="er-entity__attr er-entity__attr--pk">🔑 Status_ID</li>
          <li class="er-entity__attr er-entity__attr--fk">🔗 Promise_ID</li>
          <li class="er-entity__attr">• Status_Type</li>
          <li class="er-entity__attr">• Budget_Allocated</li>
          <li class="er-entity__attr">• Progress</li>
        </ul>
      </div>
      <div class="er-entity">
        <div class="er-entity__header">OUTCOME_INDICATOR</div>
        <ul class="er-entity__attrs">
          <li class="er-entity__attr er-entity__attr--pk">🔑 Indicator_ID</li>
          <li class="er-entity__attr er-entity__attr--fk">🔗 Promise_ID</li>
          <li class="er-entity__attr">• Indicator_Name</li>
          <li class="er-entity__attr">• Target_Value</li>
          <li class="er-entity__attr">• Measured_Value</li>
        </ul>
      </div>
    `;
    const container = document.getElementById('erDiagram');
    if (container) {
      container.innerHTML = erHTML;
    }
  }

  // Load everything immediately
  loadDashboardData();
});
