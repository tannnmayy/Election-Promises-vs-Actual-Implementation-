// ============================================================
// Chart.js Visualization Helpers
// ============================================================

const CHART_COLORS = {
  blue: '#2196f3',
  green: '#4caf50',
  red: '#f44336',
  orange: '#ff9800',
  purple: '#7c4dff',
  cyan: '#00bcd4',
  navy: '#1a237e',
  pink: '#e91e63',
  teal: '#009688',
  amber: '#ffc107',
  indigo: '#3f51b5',
  lime: '#cddc39'
};

const PALETTE = Object.values(CHART_COLORS);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { family: "'Inter', sans-serif", size: 12 },
        padding: 16,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: '#1e1e2e',
      titleFont: { family: "'Inter', sans-serif", size: 13 },
      bodyFont: { family: "'Inter', sans-serif", size: 12 },
      cornerRadius: 6,
      padding: 10
    }
  }
};

// Track chart instances to destroy before re-creating
const chartInstances = {};

function destroyChart(canvasId) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
    delete chartInstances[canvasId];
  }
}

function createBarChart(canvasId, labels, datasets, title = '') {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.color || PALETTE[i % PALETTE.length],
        borderColor: ds.borderColor || 'transparent',
        borderWidth: 1,
        borderRadius: 4,
        ...ds
      }))
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        title: { display: !!title, text: title, font: { family: "'Inter'", size: 14, weight: '600' }, color: '#1a237e' }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
  chartInstances[canvasId] = chart;
  return chart;
}

function createPieChart(canvasId, labels, data, title = '') {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: PALETTE.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      cutout: '55%',
      plugins: {
        ...CHART_DEFAULTS.plugins,
        title: { display: !!title, text: title, font: { family: "'Inter'", size: 14, weight: '600' }, color: '#1a237e' }
      }
    }
  });
  chartInstances[canvasId] = chart;
  return chart;
}

function createLineChart(canvasId, labels, datasets, title = '') {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color || PALETTE[i % PALETTE.length],
        backgroundColor: (ds.color || PALETTE[i % PALETTE.length]) + '20',
        tension: 0.3,
        fill: ds.fill || false,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        ...ds
      }))
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        title: { display: !!title, text: title, font: { family: "'Inter'", size: 14, weight: '600' }, color: '#1a237e' }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
  chartInstances[canvasId] = chart;
  return chart;
}

function createHorizontalBarChart(canvasId, labels, data, title = '') {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: PALETTE.slice(0, labels.length),
        borderRadius: 4
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      indexAxis: 'y',
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: false },
        title: { display: !!title, text: title, font: { family: "'Inter'", size: 14, weight: '600' }, color: '#1a237e' }
      },
      scales: {
        x: { beginAtZero: true, grid: { color: '#f0f0f0' } },
        y: { grid: { display: false } }
      }
    }
  });
  chartInstances[canvasId] = chart;
  return chart;
}
