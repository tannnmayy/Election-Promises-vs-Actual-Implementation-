// ============================================================
// Route: Set Operations (UNION, INTERSECT, EXCEPT)
// ============================================================

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

router.get('/union-high-priority', async (req, res) => {
  const sql = `SELECT 'Promise' AS Type, Title AS Name, Priority_Level AS Priority
FROM PROMISE WHERE Priority_Level = 'High'
UNION
SELECT 'Indicator' AS Type, Indicator_Name AS Name, 'High' AS Priority
FROM INDICATOR WHERE target_value > baseline_value * 1.5
ORDER BY Name`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'UNION' }, explanation: 'Combines high-priority promises and high-impact indicators. UNION removes duplicates.', error: result.error });
});

router.get('/union-all', async (req, res) => {
  const sql = `SELECT 'Promise' AS Type, Title AS Name FROM PROMISE
UNION ALL
SELECT 'Indicator' AS Type, Indicator_Name AS Name FROM INDICATOR
ORDER BY Type, Name`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'UNION ALL' }, explanation: 'Combines all names keeping duplicates. Faster than UNION.', error: result.error });
});

router.get('/intersect-areas', async (req, res) => {
  const sql = `SELECT pa.PolicyArea_ID, pa.Area_Name FROM POLICY_AREA pa
WHERE pa.PolicyArea_ID IN (SELECT PolicyArea_ID FROM PROMISE)
  AND pa.PolicyArea_ID IN (
    SELECT DISTINCT pa2.PolicyArea_ID FROM POLICY_AREA pa2
    JOIN INDICATOR i ON pa2.PolicyArea_ID = i.PolicyArea_ID
    JOIN OUTCOME_DATA od ON i.Indicator_ID = od.Indicator_ID)`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'Simulated INTERSECT' }, explanation: 'Finds policy areas with BOTH promises AND outcomes using IN + IN.', error: result.error });
});

router.get('/except-no-indicators', async (req, res) => {
  const sql = `SELECT p.Promise_ID, p.Title FROM PROMISE p
WHERE p.Promise_ID NOT IN (SELECT DISTINCT Promise_ID FROM PROMISE_INDICATOR)`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'Simulated EXCEPT (NOT IN)' }, explanation: 'Finds promises without linked indicators using NOT IN.', error: result.error });
});

router.get('/except-no-outcomes', async (req, res) => {
  const sql = `SELECT pa.Area_Name FROM POLICY_AREA pa
WHERE pa.PolicyArea_ID IN (SELECT PolicyArea_ID FROM PROMISE)
  AND pa.PolicyArea_ID NOT IN (
    SELECT DISTINCT ind.PolicyArea_ID FROM INDICATOR ind
    JOIN OUTCOME_DATA od ON ind.Indicator_ID = od.Indicator_ID)`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'Simulated EXCEPT' }, explanation: 'Policy areas with promises but no outcome data.', error: result.error });
});

router.get('/completed-and-inprogress', async (req, res) => {
  const sql = `SELECT p.Title, 'Completed' AS Category, i.Progress_Percentage
FROM PROMISE p JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
WHERE i.Status_Type = 'Completed'
UNION
SELECT p.Title, 'In Progress' AS Category, i.Progress_Percentage
FROM PROMISE p JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
WHERE i.Status_Type = 'In Progress'
ORDER BY Category, Progress_Percentage DESC`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'UNION — Filtered Sets' }, explanation: 'Combines completed and in-progress promises.', error: result.error });
});

module.exports = router;
