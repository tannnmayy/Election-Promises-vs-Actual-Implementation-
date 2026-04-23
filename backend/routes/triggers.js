// ============================================================
// Route: Triggers
// ============================================================
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

router.get('/list', async (req, res) => {
  const sql = `SHOW TRIGGERS FROM election_promises_db`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'SHOW TRIGGERS' }, explanation: 'Lists all triggers defined in the database, showing their name, event (INSERT/UPDATE/DELETE), timing (BEFORE/AFTER), and the table they are attached to.', error: result.error });
});

router.post('/test-update', async (req, res) => {
  const promiseId = parseInt(req.body.promise_id) || 1;
  const newProgress = parseFloat(req.body.progress) || 70;
  // Get before state
  const beforeResult = await executeQuery(`SELECT * FROM IMPLEMENTATION_STATUS WHERE Promise_ID = ?`, [promiseId]);
  // Execute update (triggers fire here)
  const updateSql = `UPDATE IMPLEMENTATION_STATUS SET Progress_Percentage = ? WHERE Promise_ID = ?`;
  const updateResult = await executeQuery(updateSql, [newProgress, promiseId]);
  // Get after state
  const afterResult = await executeQuery(`SELECT * FROM IMPLEMENTATION_STATUS WHERE Promise_ID = ?`, [promiseId]);
  // Get latest audit log
  const auditResult = await executeQuery(`SELECT * FROM PROMISE_AUDIT_LOG ORDER BY Log_ID DESC LIMIT 5`);
  res.json({
    success: updateResult.success,
    sql: `UPDATE IMPLEMENTATION_STATUS SET Progress_Percentage = ${newProgress} WHERE Promise_ID = ${promiseId}`,
    results: { before: (beforeResult.rows||[])[0], after: (afterResult.rows||[])[0], auditLog: auditResult.rows || [] },
    metadata: { executionTime: updateResult.executionTime+'ms', concept: 'Trigger — BEFORE UPDATE & AFTER UPDATE' },
    explanation: 'Fires trg_update_timestamp (auto-updates Last_Updated_Date) and trg_log_status_change (logs to PROMISE_AUDIT_LOG if status changed).',
    error: updateResult.error
  });
});

router.get('/audit-log', async (req, res) => {
  const sql = `SELECT * FROM PROMISE_AUDIT_LOG ORDER BY Changed_At DESC`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { rowCount: (result.rows||[]).length, executionTime: result.executionTime+'ms', concept: 'Trigger Audit Log' }, explanation: 'Shows the PROMISE_AUDIT_LOG table populated by the trg_log_status_change trigger whenever a status change occurs.', error: result.error });
});

module.exports = router;
