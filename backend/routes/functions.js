// ============================================================
// Route: Stored Functions
// ============================================================
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

router.post('/fulfillment-rate', async (req, res) => {
  const govtId = parseInt(req.body.govt_id) || 1;
  const sql = `SELECT Calculate_Fulfillment_Rate(?) AS Fulfillment_Rate`;
  const result = await executeQuery(sql, [govtId]);
  const defSql = `SELECT 
    g.Party_Name,
    Calculate_Fulfillment_Rate(g.Govt_ID) AS Fulfillment_Rate
FROM GOVERNMENT g`;
  res.json({ success: result.success, sql: `SELECT Calculate_Fulfillment_Rate(${govtId}) AS Fulfillment_Rate`, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'Stored Function — Calculate_Fulfillment_Rate' }, explanation: `Calls the Calculate_Fulfillment_Rate function with Govt_ID = ${govtId}. This function counts total and completed promises for a government and returns the completion percentage.`, error: result.error });
});

router.post('/status-category', async (req, res) => {
  const progress = parseFloat(req.body.progress) || 50;
  const sql = `SELECT Get_Status_Category(?) AS Status_Category`;
  const result = await executeQuery(sql, [progress]);
  res.json({ success: result.success, sql: `SELECT Get_Status_Category(${progress}) AS Status_Category`, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'Stored Function — Get_Status_Category' }, explanation: `Calls Get_Status_Category with progress = ${progress}%. Returns: Excellent (>=90), Good (>=75), Average (>=50), Poor (>=25), or Critical (<25).`, error: result.error });
});

router.post('/budget-efficiency', async (req, res) => {
  const promiseId = parseInt(req.body.promise_id) || 1;
  const sql = `SELECT Calculate_Budget_Efficiency(?) AS Efficiency_Score`;
  const result = await executeQuery(sql, [promiseId]);
  res.json({ success: result.success, sql: `SELECT Calculate_Budget_Efficiency(${promiseId}) AS Efficiency_Score`, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'Stored Function — Calculate_Budget_Efficiency' }, explanation: `Calls Calculate_Budget_Efficiency for Promise_ID = ${promiseId}. Calculates progress achieved per million rupees spent.`, error: result.error });
});

router.get('/all-with-functions', async (req, res) => {
  const sql = `SELECT 
    p.Title,
    p.Budget_Allocated,
    i.Progress_Percentage,
    Get_Status_Category(i.Progress_Percentage) AS Category,
    Calculate_Budget_Efficiency(p.Promise_ID) AS Efficiency
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'Using Functions in SELECT' }, explanation: 'Demonstrates using stored functions inside a SELECT statement to compute derived columns.', error: result.error });
});

module.exports = router;
