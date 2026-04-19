-- ============================================================
-- Election Promises vs Actual Implementation
-- 06_set_operations.sql — UNION, INTERSECT, EXCEPT
-- ============================================================

USE election_promises_db;

-- ============================================================
-- 1. UNION: All high-priority items (promises + indicators)
-- ============================================================
SELECT 'Promise' AS Type, Title AS Name, Priority_Level AS Priority
FROM PROMISE
WHERE Priority_Level = 'High'
UNION
SELECT 'Indicator' AS Type, Indicator_Name AS Name, 'High' AS Priority
FROM INDICATOR
WHERE target_value > baseline_value * 1.5
ORDER BY Name;

-- ============================================================
-- 2. UNION ALL: Combine all promise and indicator names (with duplicates)
-- ============================================================
SELECT 'Promise' AS Type, Title AS Name FROM PROMISE
UNION ALL
SELECT 'Indicator' AS Type, Indicator_Name AS Name FROM INDICATOR
ORDER BY Type, Name;

-- ============================================================
-- 3. Simulated INTERSECT: Policy areas that have BOTH promises AND outcome data
--    (MySQL <8.0.31 does not support INTERSECT natively)
-- ============================================================
SELECT pa.PolicyArea_ID, pa.Area_Name
FROM POLICY_AREA pa
WHERE pa.PolicyArea_ID IN (SELECT PolicyArea_ID FROM PROMISE)
  AND pa.PolicyArea_ID IN (
      SELECT DISTINCT pa2.PolicyArea_ID
      FROM POLICY_AREA pa2
      JOIN INDICATOR i ON pa2.PolicyArea_ID = i.PolicyArea_ID
      JOIN OUTCOME_DATA od ON i.Indicator_ID = od.Indicator_ID
  );

-- ============================================================
-- 4. Simulated EXCEPT: Promises that do NOT have any linked indicators
-- ============================================================
SELECT p.Promise_ID, p.Title
FROM PROMISE p
WHERE p.Promise_ID NOT IN (
    SELECT DISTINCT Promise_ID FROM PROMISE_INDICATOR
);

-- ============================================================
-- 5. Simulated EXCEPT: Policy areas with promises but NO outcome data
-- ============================================================
SELECT pa.Area_Name
FROM POLICY_AREA pa
WHERE pa.PolicyArea_ID IN (SELECT PolicyArea_ID FROM PROMISE)
  AND pa.PolicyArea_ID NOT IN (
      SELECT DISTINCT ind.PolicyArea_ID
      FROM INDICATOR ind
      JOIN OUTCOME_DATA od ON ind.Indicator_ID = od.Indicator_ID
  );

-- ============================================================
-- 6. UNION: Completed and In-Progress promises together
-- ============================================================
SELECT p.Title, 'Completed' AS Category, i.Progress_Percentage
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
WHERE i.Status_Type = 'Completed'
UNION
SELECT p.Title, 'In Progress' AS Category, i.Progress_Percentage
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
WHERE i.Status_Type = 'In Progress'
ORDER BY Category, Progress_Percentage DESC;
