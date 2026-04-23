// ============================================================
// Route: Joins (INNER, LEFT, RIGHT, CROSS, SELF, NATURAL)
// ============================================================

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ─── Query 1: INNER JOIN — Complete promise analysis ─────────
router.get('/promise-details', async (req, res) => {
  const sql = `SELECT 
    p.Title AS Promise,
    g.Party_Name,
    pa.Area_Name AS Policy_Area,
    p.Budget_Allocated,
    i.Status_Type,
    i.Progress_Percentage,
    DATEDIFF(i.Last_Updated_Date, CONCAT(p.Announcement_Year, '-01-01')) AS Days_Since_Announcement
FROM PROMISE p
INNER JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
INNER JOIN POLICY_AREA pa ON p.PolicyArea_ID = pa.PolicyArea_ID
INNER JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
ORDER BY i.Progress_Percentage DESC`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'INNER JOIN (Multi-table)'
    },
    explanation: 'Combines data from 4 tables using INNER JOIN. Only rows with matching keys in ALL tables are included. Shows the complete picture of each promise with its government, policy area, and implementation status.',
    error: result.error
  });
});

// ─── Query 2: LEFT JOIN — All promises with optional outcomes ─
router.get('/promises-with-outcomes', async (req, res) => {
  const sql = `SELECT 
    p.Title,
    g.Party_Name,
    ind.Indicator_Name,
    od.Year,
    od.Measured_Value,
    ind.target_value
FROM PROMISE p
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
LEFT JOIN PROMISE_INDICATOR pi ON p.Promise_ID = pi.Promise_ID
LEFT JOIN INDICATOR ind ON pi.Indicator_ID = ind.Indicator_ID
LEFT JOIN OUTCOME_DATA od ON ind.Indicator_ID = od.Indicator_ID 
    AND od.Govt_ID = g.Govt_ID
ORDER BY p.Title, od.Year`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'LEFT JOIN'
    },
    explanation: 'Shows ALL promises, even those without linked indicators or outcome data. LEFT JOIN preserves all rows from the left table (PROMISE) and fills NULLs for unmatched right-side columns.',
    error: result.error
  });
});

// ─── Query 3: RIGHT JOIN — All policy areas ──────────────────
router.get('/all-policy-areas', async (req, res) => {
  const sql = `SELECT 
    pa.Area_Name,
    p.Title AS Promise_Title,
    p.Budget_Allocated
FROM PROMISE p
RIGHT JOIN POLICY_AREA pa ON p.PolicyArea_ID = pa.PolicyArea_ID
ORDER BY pa.Area_Name`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'RIGHT JOIN'
    },
    explanation: 'Shows ALL policy areas including those without any promises. RIGHT JOIN preserves all rows from the right table (POLICY_AREA). Areas with no promises show NULL for promise columns.',
    error: result.error
  });
});

// ─── Query 4: CROSS JOIN — Government comparison matrix ──────
router.get('/government-comparison', async (req, res) => {
  const sql = `SELECT 
    g1.Party_Name AS Gov1,
    g2.Party_Name AS Gov2,
    ROUND(AVG(i1.Progress_Percentage), 2) AS Gov1_Avg,
    ROUND(AVG(i2.Progress_Percentage), 2) AS Gov2_Avg
FROM GOVERNMENT g1
CROSS JOIN GOVERNMENT g2
LEFT JOIN PROMISE p1 ON g1.Govt_ID = p1.Govt_ID
LEFT JOIN PROMISE p2 ON g2.Govt_ID = p2.Govt_ID
LEFT JOIN IMPLEMENTATION_STATUS i1 ON p1.Promise_ID = i1.Promise_ID
LEFT JOIN IMPLEMENTATION_STATUS i2 ON p2.Promise_ID = i2.Promise_ID
WHERE g1.Govt_ID < g2.Govt_ID
GROUP BY g1.Party_Name, g2.Party_Name`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'CROSS JOIN'
    },
    explanation: 'Creates a comparison matrix by pairing every government with every other government using CROSS JOIN. The WHERE clause (g1 < g2) avoids duplicates and self-pairs.',
    error: result.error
  });
});

// ─── Query 5: SELF JOIN — Compare promises within same govt ──
router.get('/self-join', async (req, res) => {
  const sql = `SELECT 
    p1.Title AS Promise_1,
    p2.Title AS Promise_2,
    p1.Budget_Allocated AS Budget_1,
    p2.Budget_Allocated AS Budget_2,
    g.Party_Name
FROM PROMISE p1
JOIN PROMISE p2 ON p1.Govt_ID = p2.Govt_ID AND p1.Promise_ID < p2.Promise_ID
JOIN GOVERNMENT g ON p1.Govt_ID = g.Govt_ID
ORDER BY g.Party_Name`;

  const result = await executeQuery(sql);
  res.json({
    success: result.success,
    sql,
    results: result.rows || [],
    metadata: {
      rowCount: result.rows ? result.rows.length : 0,
      executionTime: result.executionTime + 'ms',
      concept: 'SELF JOIN'
    },
    explanation: 'Joins the PROMISE table with itself to compare different promises made by the same government. The condition p1.Promise_ID < p2.Promise_ID ensures each pair appears only once.',
    error: result.error
  });
});

module.exports = router;
