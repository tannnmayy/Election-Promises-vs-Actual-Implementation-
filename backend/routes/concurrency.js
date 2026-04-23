// ============================================================
// Route: Concurrency Control & Transactions
// ============================================================
const express = require('express');
const router = express.Router();
const { pool, executeQuery } = require('../config/database');

router.post('/transaction', async (req, res) => {
  const promiseId = parseInt(req.body.promise_id) || 1;
  const newBudget = parseFloat(req.body.budget) || 55000000;
  const newProgress = parseFloat(req.body.progress) || 70;
  const conn = await pool.getConnection();
  const steps = [];
  try {
    // Step 1: Get before state
    const [before] = await conn.query(`SELECT p.Budget_Allocated, i.Progress_Percentage FROM PROMISE p JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID WHERE p.Promise_ID = ?`, [promiseId]);
    steps.push({ step: 1, action: 'SELECT (before)', data: before[0] });
    // Step 2: START TRANSACTION
    await conn.query('START TRANSACTION');
    steps.push({ step: 2, action: 'START TRANSACTION', data: 'Transaction started' });
    // Step 3: Update budget
    await conn.query('UPDATE PROMISE SET Budget_Allocated = ? WHERE Promise_ID = ?', [newBudget, promiseId]);
    steps.push({ step: 3, action: 'UPDATE PROMISE', data: `Budget set to ${newBudget}` });
    // Step 4: Update progress
    await conn.query('UPDATE IMPLEMENTATION_STATUS SET Progress_Percentage = ?, Last_Updated_Date = CURDATE() WHERE Promise_ID = ?', [newProgress, promiseId]);
    steps.push({ step: 4, action: 'UPDATE IMPLEMENTATION_STATUS', data: `Progress set to ${newProgress}%` });
    // Step 5: COMMIT
    await conn.query('COMMIT');
    steps.push({ step: 5, action: 'COMMIT', data: 'Transaction committed successfully' });
    // Step 6: Get after state
    const [after] = await conn.query(`SELECT p.Budget_Allocated, i.Progress_Percentage FROM PROMISE p JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID WHERE p.Promise_ID = ?`, [promiseId]);
    steps.push({ step: 6, action: 'SELECT (after)', data: after[0] });
    res.json({ success: true, sql: 'START TRANSACTION; UPDATE...; UPDATE...; COMMIT;', results: steps, metadata: { concept: 'Transaction with COMMIT' }, explanation: 'Demonstrates a complete transaction: START TRANSACTION → multiple UPDATEs → COMMIT. All changes are atomic — either all succeed or none.' });
  } catch (err) {
    await conn.query('ROLLBACK');
    steps.push({ step: 'ERROR', action: 'ROLLBACK', data: err.message });
    res.json({ success: false, results: steps, metadata: { concept: 'Transaction with ROLLBACK' }, explanation: 'Transaction failed and was rolled back. No changes were applied.', error: err.message });
  } finally {
    conn.release();
  }
});

router.post('/test-isolation/:level', async (req, res) => {
  const level = req.params.level.replace(/[^A-Z_ ]/gi, '').toUpperCase();
  const validLevels = ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'];
  if (!validLevels.includes(level)) {
    return res.json({ success: false, error: 'Invalid isolation level. Use: ' + validLevels.join(', ') });
  }
  const conn = await pool.getConnection();
  try {
    await conn.query(`SET SESSION TRANSACTION ISOLATION LEVEL ${level}`);
    await conn.query('START TRANSACTION');
    const [rows] = await conn.query('SELECT * FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 1');
    await conn.query('COMMIT');
    await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    res.json({
      success: true,
      sql: `SET SESSION TRANSACTION ISOLATION LEVEL ${level};\nSTART TRANSACTION;\nSELECT * FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 1;\nCOMMIT;`,
      results: rows,
      metadata: { concept: `Isolation Level — ${level}` },
      explanation: getIsolationExplanation(level)
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
});

router.post('/savepoint-demo', async (req, res) => {
  const conn = await pool.getConnection();
  const steps = [];
  try {
    const [orig] = await conn.query('SELECT Promise_ID, Title, Budget_Allocated FROM PROMISE WHERE Promise_ID IN (1,2,3) ORDER BY Promise_ID');
    steps.push({ step: 1, action: 'Original state', data: orig });
    await conn.query('START TRANSACTION');
    steps.push({ step: 2, action: 'START TRANSACTION' });
    await conn.query('UPDATE PROMISE SET Budget_Allocated = 60000000 WHERE Promise_ID = 1');
    steps.push({ step: 3, action: 'UPDATE Promise 1 budget to 60M' });
    await conn.query('SAVEPOINT sp1');
    steps.push({ step: 4, action: 'SAVEPOINT sp1' });
    await conn.query('UPDATE PROMISE SET Budget_Allocated = 80000000 WHERE Promise_ID = 2');
    steps.push({ step: 5, action: 'UPDATE Promise 2 budget to 80M' });
    await conn.query('SAVEPOINT sp2');
    steps.push({ step: 6, action: 'SAVEPOINT sp2' });
    await conn.query('UPDATE PROMISE SET Budget_Allocated = 200000000 WHERE Promise_ID = 3');
    steps.push({ step: 7, action: 'UPDATE Promise 3 budget to 200M' });
    await conn.query('ROLLBACK TO sp2');
    steps.push({ step: 8, action: 'ROLLBACK TO sp2 — Promise 3 change undone' });
    await conn.query('COMMIT');
    steps.push({ step: 9, action: 'COMMIT — Promises 1 & 2 saved' });
    const [final] = await conn.query('SELECT Promise_ID, Title, Budget_Allocated FROM PROMISE WHERE Promise_ID IN (1,2,3) ORDER BY Promise_ID');
    steps.push({ step: 10, action: 'Final state', data: final });
    // Restore original values
    await conn.query('UPDATE PROMISE SET Budget_Allocated = ? WHERE Promise_ID = 1', [orig[0].Budget_Allocated]);
    await conn.query('UPDATE PROMISE SET Budget_Allocated = ? WHERE Promise_ID = 2', [orig[1].Budget_Allocated]);
    res.json({ success: true, sql: 'START TRANSACTION; UPDATE...; SAVEPOINT sp1; UPDATE...; SAVEPOINT sp2; UPDATE...; ROLLBACK TO sp2; COMMIT;', results: steps, metadata: { concept: 'Savepoints' }, explanation: 'Demonstrates SAVEPOINT: changes after sp2 are rolled back while earlier changes are preserved. Promise 3 update is undone, but Promises 1 & 2 changes are committed.' });
  } catch (err) {
    await conn.query('ROLLBACK');
    res.json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
});

router.get('/show-locks', async (req, res) => {
  const sql = `SELECT * FROM information_schema.INNODB_TRX`;
  const result = await executeQuery(sql);
  res.json({ success: result.success, sql, results: result.rows || [], metadata: { concept: 'Active Transactions / Locks' }, explanation: 'Shows currently active InnoDB transactions. When transactions hold locks, they appear here.', error: result.error });
});

function getIsolationExplanation(level) {
  const explanations = {
    'READ UNCOMMITTED': 'Lowest isolation. Can read uncommitted data from other transactions (dirty reads). Fastest but least safe.',
    'READ COMMITTED': 'Only reads committed data. Prevents dirty reads but allows non-repeatable reads (same query may return different results within one transaction).',
    'REPEATABLE READ': 'MySQL default. Guarantees same results for repeated reads within a transaction. Prevents dirty and non-repeatable reads.',
    'SERIALIZABLE': 'Strictest level. Transactions execute as if serial. Prevents all anomalies but has highest performance cost due to locking.'
  };
  return explanations[level] || '';
}

module.exports = router;
