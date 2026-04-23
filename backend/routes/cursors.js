// ============================================================
// Route: Cursors
// ============================================================
const express = require('express');
const router = express.Router();
const { executeRawQuery, executeQuery } = require('../config/database');

router.post('/bulk-update-overdue', async (req, res) => {
  const sql = `CALL Mark_Overdue_Promises()`;
  const result = await executeRawQuery(sql);
  // Get current state after cursor ran
  const stateResult = await executeQuery(`SELECT p.Title, p.Target_Year, i.Status_Type, i.Remarks
FROM PROMISE p JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID`);
  const rows = Array.isArray(result.rows) ? result.rows : [result.rows];
  res.json({
    success: result.success, sql,
    results: { cursorOutput: rows.flat ? rows.flat() : rows, currentState: stateResult.rows || [] },
    metadata: { executionTime: result.executionTime+'ms', concept: 'Cursor — Mark_Overdue_Promises' },
    explanation: 'Executes a cursor-based procedure that iterates through promises past their target year and marks them as Delayed. The cursor fetches one row at a time in a loop.',
    error: result.error
  });
});

router.post('/all-govt-reports', async (req, res) => {
  const sql = `CALL Generate_All_Govt_Performance()`;
  const result = await executeRawQuery(sql);
  const rows = Array.isArray(result.rows) ? result.rows : [result.rows];
  res.json({
    success: result.success, sql,
    results: rows.flat ? rows.flat() : rows,
    metadata: { executionTime: result.executionTime+'ms', concept: 'Cursor — Generate_All_Govt_Performance' },
    explanation: 'Uses a cursor to iterate through all governments, calculating performance metrics for each, and storing results in a temporary table which is then returned.',
    error: result.error
  });
});

module.exports = router;
