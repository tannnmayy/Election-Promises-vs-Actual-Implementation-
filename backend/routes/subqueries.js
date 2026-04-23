// ============================================================
// Route: Subqueries (Nested & Correlated)
// ============================================================

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ─── Query 1: Below-average progress (Scalar Subquery) ───────
router.get('/below-average-progress', async (req, res) => {
  const sql = `SELECT 
    p.Title, 
    i.Progress_Percentage, 
    g.Party_Name,
    (SELECT ROUND(AVG(Progress_Percentage), 2) FROM IMPLEMENTATION_STATUS) AS Overall_Average
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
WHERE i.Progress_Percentage < (
    SELECT AVG(Progress_Percentage) FROM IMPLEMENTATION_STATUS
)
ORDER BY i.Progress_Percentage`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'Scalar Subquery in WHERE clause'
    },
    explanation: 'Finds promises with below-average progress. The inner subquery calculates the overall average, and the outer query filters promises below that threshold. This is a scalar subquery — it returns a single value.',
    error: result.error
  });
});

// ─── Query 2: Above-average promise count (Derived Table) ────
router.get('/above-average-promises', async (req, res) => {
  const sql = `SELECT 
    g.Party_Name, 
    g.Chief_Minister, 
    COUNT(p.Promise_ID) AS Promise_Count
FROM GOVERNMENT g
JOIN PROMISE p ON g.Govt_ID = p.Govt_ID
GROUP BY g.Govt_ID, g.Party_Name, g.Chief_Minister
HAVING COUNT(p.Promise_ID) > (
    SELECT AVG(promise_count)
    FROM (
        SELECT COUNT(*) AS promise_count
        FROM PROMISE
        GROUP BY Govt_ID
    ) AS avg_calc
)`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'Derived Table (Subquery in HAVING)'
    },
    explanation: 'Identifies governments that made more promises than the average number of promises per government. Uses a derived table (subquery in FROM) inside a HAVING clause — a two-level nesting.',
    error: result.error
  });
});

// ─── Query 3: Policy areas with no completed promises (NOT IN)
router.get('/no-completed-areas', async (req, res) => {
  const sql = `SELECT pa.Area_Name
FROM POLICY_AREA pa
WHERE pa.PolicyArea_ID NOT IN (
    SELECT DISTINCT p.PolicyArea_ID
    FROM PROMISE p
    JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
    WHERE i.Status_Type = 'Completed'
)`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'NOT IN Subquery'
    },
    explanation: 'Finds policy areas that have no completed promises. The subquery finds all policy area IDs with at least one completed promise, and the outer query uses NOT IN to find the complement.',
    error: result.error
  });
});

// ─── Query 4: Correlated subquery — each promise vs govt avg ─
router.get('/correlated-comparison', async (req, res) => {
  const sql = `SELECT 
    p.Title,
    i.Progress_Percentage,
    g.Party_Name,
    (SELECT ROUND(AVG(i2.Progress_Percentage), 2)
     FROM PROMISE p2
     JOIN IMPLEMENTATION_STATUS i2 ON p2.Promise_ID = i2.Promise_ID
     WHERE p2.Govt_ID = p.Govt_ID
    ) AS Govt_Avg_Progress,
    ROUND(i.Progress_Percentage - (
        SELECT AVG(i2.Progress_Percentage)
        FROM PROMISE p2
        JOIN IMPLEMENTATION_STATUS i2 ON p2.Promise_ID = i2.Promise_ID
        WHERE p2.Govt_ID = p.Govt_ID
    ), 2) AS Deviation_From_Avg
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
ORDER BY Deviation_From_Avg`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'Correlated Subquery'
    },
    explanation: 'Compares each promise\'s progress against its government\'s average. The subquery is correlated — it references the outer query\'s p.Govt_ID, so it re-executes for each row in the outer query.',
    error: result.error
  });
});

// ─── Query 5: EXISTS — govts with at least one completed ─────
router.get('/exists-completed', async (req, res) => {
  const sql = `SELECT g.Party_Name, g.Chief_Minister
FROM GOVERNMENT g
WHERE EXISTS (
    SELECT 1
    FROM PROMISE p
    JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
    WHERE p.Govt_ID = g.Govt_ID
      AND i.Status_Type = 'Completed'
)`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'EXISTS Subquery'
    },
    explanation: 'Finds governments that have at least one completed promise. EXISTS returns TRUE if the subquery returns any rows. Unlike IN, EXISTS stops searching as soon as it finds one match — often more efficient.',
    error: result.error
  });
});

module.exports = router;
