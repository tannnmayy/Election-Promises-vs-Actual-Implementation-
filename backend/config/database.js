// ============================================================
// Database Configuration — MySQL Connection Pool
// ============================================================

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'election_promises_db',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Execute a SQL query with optional parameters.
 * Uses parameterized queries to prevent SQL injection.
 * @param {string} sql - The SQL query string
 * @param {Array} params - Optional parameters for prepared statements
 * @returns {Object} { success, rows, fields } or { success, error }
 */
async function executeQuery(sql, params = []) {
  const start = Date.now();
  try {
    const [rows, fields] = await pool.execute(sql, params);
    const executionTime = Date.now() - start;
    return { success: true, rows, fields, executionTime };
  } catch (error) {
    const executionTime = Date.now() - start;
    console.error('Query Error:', error.message);
    return { success: false, error: error.message, executionTime };
  }
}

/**
 * Execute a raw query (for procedures that return multiple result sets).
 * @param {string} sql
 * @param {Array} params
 */
async function executeRawQuery(sql, params = []) {
  const start = Date.now();
  try {
    const conn = await pool.getConnection();
    try {
      const [rows, fields] = await conn.query(sql, params);
      const executionTime = Date.now() - start;
      return { success: true, rows, fields, executionTime };
    } finally {
      conn.release();
    }
  } catch (error) {
    const executionTime = Date.now() - start;
    console.error('Raw Query Error:', error.message);
    return { success: false, error: error.message, executionTime };
  }
}

/**
 * Test database connectivity.
 */
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

module.exports = { pool, executeQuery, executeRawQuery, testConnection };
