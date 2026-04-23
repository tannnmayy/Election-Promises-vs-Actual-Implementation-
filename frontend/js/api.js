// ============================================================
// API Communication Layer
// ============================================================

const API_BASE = '/api';

/**
 * Fetch data from the backend API.
 * @param {string} endpoint - API endpoint path (e.g., '/aggregate/count-by-status')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Object} Parsed JSON response
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { success: false, error: error.message };
  }
}

/** GET helper */
async function apiGet(endpoint) {
  return fetchAPI(endpoint);
}

/** POST helper */
async function apiPost(endpoint, body = {}) {
  return fetchAPI(endpoint, { method: 'POST', body });
}

/** Check database health */
async function checkHealth() {
  return fetchAPI('/health');
}
