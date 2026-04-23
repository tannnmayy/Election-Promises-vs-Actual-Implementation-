// ============================================================
// Route: Stored Procedures
// ============================================================
const express = require('express');
const router = express.Router();
const { executeRawQuery } = require('../config/database');

router.post('/update-status', async (req, res) => {
  const { promise_id, status, progress, remarks } = req.body;
  const pId = parseInt(promise_id) || 1;
  const pStatus = status || 'In Progress';
  const pProgress = parseFloat(progress) || 50;
  const pRemarks = remarks || 'Updated via dashboard';
  const sql = `CALL Update_Promise_Status(${pId}, '${pStatus}', ${pProgress}, '${pRemarks}', @result); SELECT @result AS Result;`;
  const result = await executeRawQuery(sql);
  // result.rows is array of result sets
  const rows = Array.isArray(result.rows) ? result.rows : [result.rows];
  res.json({ success: result.success, sql: `CALL Update_Promise_Status(${pId}, '${pStatus}', ${pProgress}, '${pRemarks}', @result)`, results: rows.flat ? rows.flat() : rows, metadata: { executionTime: result.executionTime+'ms', concept: 'Stored Procedure — Update_Promise_Status' }, explanation: `Calls the Update_Promise_Status procedure with validation. If status is 'Completed' but progress < 100, it returns an error. Uses transactions internally.`, error: result.error });
});

router.post('/government-report', async (req, res) => {
  const govtId = parseInt(req.body.govt_id) || 1;
  const sql = `CALL Generate_Government_Report(${govtId})`;
  const result = await executeRawQuery(sql);
  const rows = Array.isArray(result.rows) ? result.rows : [result.rows];
  res.json({ success: result.success, sql, results: rows, metadata: { executionTime: result.executionTime+'ms', concept: 'Stored Procedure — Generate_Government_Report' }, explanation: `Generates a comprehensive report for Government ID ${govtId}. Returns two result sets: summary statistics and detailed promise list.`, error: result.error });
});

module.exports = router;
