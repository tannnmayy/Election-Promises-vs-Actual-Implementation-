// ============================================================
// Route: Views
// ============================================================
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

router.get('/active-dashboard', async (req, res) => {
  const sql = `SELECT * FROM Active_Promises_Dashboard`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'VIEW — Active_Promises_Dashboard' }, explanation: 'Queries the Active_Promises_Dashboard view which joins PROMISE, GOVERNMENT, POLICY_AREA, and IMPLEMENTATION_STATUS to show only active (In Progress/Not Started) promises with a performance rating.', error: result.error });
});

router.get('/performance-scorecard', async (req, res) => {
  const sql = `SELECT * FROM Government_Performance_Scorecard`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'VIEW — Government_Performance_Scorecard' }, explanation: 'Queries the Government_Performance_Scorecard view showing total promises, completed/abandoned counts, average progress, total budget, and completion rate per government.', error: result.error });
});

router.get('/outcome-analysis', async (req, res) => {
  const sql = `SELECT * FROM Promise_Outcome_Analysis`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'VIEW — Promise_Outcome_Analysis' }, explanation: 'Shows promise progress alongside actual outcome data, calculating the target achievement percentage for each indicator.', error: result.error });
});

router.get('/area-effectiveness', async (req, res) => {
  const sql = `SELECT * FROM Policy_Area_Effectiveness`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'VIEW — Policy_Area_Effectiveness' }, explanation: 'Evaluates the effectiveness of each policy area by combining promise progress with outcome achievement metrics.', error: result.error });
});

router.get('/definition/:viewName', async (req, res) => {
  const viewName = req.params.viewName.replace(/[^a-zA-Z_]/g, '');
  const sql = `SHOW CREATE VIEW ${viewName}`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'SHOW CREATE VIEW' }, explanation: `Shows the CREATE VIEW definition for ${viewName}.`, error: result.error });
});

module.exports = router;
