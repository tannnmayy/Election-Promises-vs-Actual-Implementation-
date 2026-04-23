// ============================================================
// Route: Aggregate Functions
// ============================================================

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ─── Query 1: Count promises by status ───────────────────────
router.get('/count-by-status', async (req, res) => {
  const sql = `SELECT 
    Status_Type, 
    COUNT(*) AS Total_Promises,
    ROUND(AVG(Progress_Percentage), 2) AS Avg_Progress
FROM IMPLEMENTATION_STATUS
GROUP BY Status_Type
ORDER BY Total_Promises DESC`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'Aggregate Functions — COUNT, AVG, GROUP BY'
    },
    explanation: 'Counts the number of promises grouped by their implementation status (Completed, In Progress, Delayed, etc.) and calculates the average progress for each status type.',
    error: result.error
  });
});

// ─── Query 2: Average progress by party (HAVING) ─────────────
router.get('/avg-progress-by-party', async (req, res) => {
  const sql = `SELECT 
    g.Party_Name, 
    ROUND(AVG(i.Progress_Percentage), 2) AS Avg_Progress,
    COUNT(p.Promise_ID) AS Total_Promises
FROM GOVERNMENT g
JOIN PROMISE p ON g.Govt_ID = p.Govt_ID
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
GROUP BY g.Party_Name
HAVING AVG(i.Progress_Percentage) > 50
ORDER BY Avg_Progress DESC`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'Aggregate Functions — AVG, COUNT, GROUP BY, HAVING'
    },
    explanation: 'Calculates the average implementation progress for each government party, filtering to show only parties with average progress above 50%. Uses HAVING (not WHERE) because the filter applies to aggregated values.',
    error: result.error
  });
});

// ─── Query 3: Total budget by policy area ────────────────────
router.get('/budget-by-area', async (req, res) => {
  const sql = `SELECT 
    pa.Area_Name, 
    SUM(p.Budget_Allocated) AS Total_Budget,
    COUNT(p.Promise_ID) AS Promise_Count,
    ROUND(AVG(p.Budget_Allocated), 2) AS Avg_Budget
FROM POLICY_AREA pa
LEFT JOIN PROMISE p ON pa.PolicyArea_ID = p.PolicyArea_ID
GROUP BY pa.Area_Name
ORDER BY Total_Budget DESC`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'Aggregate Functions — SUM, COUNT, AVG, LEFT JOIN, GROUP BY'
    },
    explanation: 'Calculates total budget allocation, promise count, and average budget per policy area. Uses LEFT JOIN to include policy areas with no promises.',
    error: result.error
  });
});

// ─── Query 4: MIN/MAX implementation periods ─────────────────
router.get('/min-max-periods', async (req, res) => {
  const sql = `SELECT 
    MIN(Progress_Percentage) AS Min_Progress,
    MAX(Progress_Percentage) AS Max_Progress,
    MIN(Last_Updated_Date) AS Earliest_Update,
    MAX(Last_Updated_Date) AS Latest_Update
FROM IMPLEMENTATION_STATUS`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'Aggregate Functions — MIN, MAX'
    },
    explanation: 'Finds the minimum and maximum progress percentages and update dates across all implementation statuses. MIN/MAX work on both numeric and date types.',
    error: result.error
  });
});

// ─── Query 5: Budget statistics per government ───────────────
router.get('/performance-scorecard', async (req, res) => {
  const sql = `SELECT 
    g.Party_Name,
    COUNT(p.Promise_ID) AS Promise_Count,
    SUM(p.Budget_Allocated) AS Total_Budget,
    MIN(p.Budget_Allocated) AS Min_Budget,
    MAX(p.Budget_Allocated) AS Max_Budget,
    ROUND(AVG(p.Budget_Allocated), 2) AS Avg_Budget
FROM GOVERNMENT g
LEFT JOIN PROMISE p ON g.Govt_ID = p.Govt_ID
GROUP BY g.Govt_ID, g.Party_Name
ORDER BY Total_Budget DESC`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'Aggregate Functions — COUNT, SUM, MIN, MAX, AVG, GROUP BY'
    },
    explanation: 'Comprehensive budget statistics for each government: total count, sum, minimum, maximum, and average budget allocation. Demonstrates all five standard aggregate functions together.',
    error: result.error
  });
});

module.exports = router;
