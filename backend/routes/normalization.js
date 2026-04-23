// ============================================================
// Route: Normalization
// ============================================================
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

router.get('/table/:tableName', async (req, res) => {
  const tableName = req.params.tableName.replace(/[^a-zA-Z_]/g, '');
  const descSql = `DESCRIBE ${tableName}`;
  const dataSql = `SELECT * FROM ${tableName} LIMIT 10`;
  const descResult = await executeQuery(descSql);
  const dataResult = await executeQuery(dataSql);
  res.json({
    success: descResult.success && dataResult.success,
    results: { structure: descResult.rows || [], sampleData: dataResult.rows || [] },
    metadata: { concept: 'Table Structure & Sample Data' },
    explanation: `Shows the structure (columns, types, keys) and first 10 rows of the ${tableName} table.`,
    error: descResult.error || dataResult.error
  });
});

router.get('/denormalized-example', async (req, res) => {
  // Create temp denormalized view on the fly
  const sql = `SELECT 
    p.Promise_ID, p.Title, p.Description, p.Announcement_Year,
    g.Party_Name, g.Chief_Minister,
    pa.Area_Name,
    i.Status_Type, i.Progress_Percentage
FROM PROMISE p
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
JOIN POLICY_AREA pa ON p.PolicyArea_ID = pa.PolicyArea_ID
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID`;
  const result = await executeQuery(sql);
  // Show redundancy
  const redundancySql = `SELECT g.Party_Name, g.Chief_Minister, COUNT(*) AS Redundant_Copies
FROM PROMISE p JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
GROUP BY g.Party_Name, g.Chief_Minister`;
  const redundancyResult = await executeQuery(redundancySql);
  res.json({
    success: result.success,
    sql,
    results: { denormalized: result.rows || [], redundancy: redundancyResult.rows || [] },
    metadata: { concept: 'Denormalized Table — showing redundancy' },
    explanation: 'Shows what the data would look like in a single denormalized table. Party_Name and Chief_Minister are repeated for every promise of that government — this is the redundancy that normalization eliminates.',
    error: result.error
  });
});

router.get('/dependencies/:tableName', async (req, res) => {
  const tableName = req.params.tableName.replace(/[^a-zA-Z_]/g, '');
  const descResult = await executeQuery(`DESCRIBE ${tableName}`);
  const fkSql = `SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`;
  const fkResult = await executeQuery(fkSql, [tableName]);
  const indexSql = `SHOW INDEX FROM ${tableName}`;
  const indexResult = await executeQuery(indexSql);
  res.json({
    success: true,
    results: { columns: descResult.rows || [], foreignKeys: fkResult.rows || [], indexes: indexResult.rows || [] },
    metadata: { concept: 'Functional Dependencies & Foreign Keys' },
    explanation: `Analyzes the ${tableName} table showing its columns, foreign key relationships, and indexes. Foreign keys represent referential dependencies between tables.`,
    error: descResult.error || fkResult.error
  });
});

router.get('/redundancy-check', async (req, res) => {
  const normalizedSql = `SELECT Party_Name, Chief_Minister FROM GOVERNMENT`;
  const normalizedResult = await executeQuery(normalizedSql);
  const denormSql = `SELECT g.Party_Name, g.Chief_Minister, COUNT(*) AS Copies
FROM PROMISE p JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
GROUP BY g.Party_Name, g.Chief_Minister`;
  const denormResult = await executeQuery(denormSql);
  res.json({
    success: true,
    results: { normalized: normalizedResult.rows || [], denormalized: denormResult.rows || [] },
    metadata: { concept: 'Redundancy Comparison: Normalized vs Denormalized' },
    explanation: 'Compares storage: in the normalized design, each government is stored once. In a denormalized table, government info would be repeated for every promise.',
    error: null
  });
});

module.exports = router;
