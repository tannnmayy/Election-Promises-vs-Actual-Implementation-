-- ============================================================
-- Election Promises vs Actual Implementation
-- 04_queries_subqueries.sql — Subqueries (Nested, Correlated)
-- ============================================================

USE election_promises_db;

-- ============================================================
-- 1. Promises with below-average progress (Scalar Subquery)
-- ============================================================
SELECT 
    p.Title, 
    i.Progress_Percentage, 
    g.Party_Name
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
WHERE i.Progress_Percentage < (
    SELECT AVG(Progress_Percentage) FROM IMPLEMENTATION_STATUS
)
ORDER BY i.Progress_Percentage;

-- ============================================================
-- 2. Governments that made more promises than average (Derived Table)
-- ============================================================
SELECT 
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
);

-- ============================================================
-- 3. Policy areas with no completed promises (NOT IN Subquery)
-- ============================================================
SELECT pa.Area_Name
FROM POLICY_AREA pa
WHERE pa.PolicyArea_ID NOT IN (
    SELECT DISTINCT p.PolicyArea_ID
    FROM PROMISE p
    JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
    WHERE i.Status_Type = 'Completed'
);

-- ============================================================
-- 4. Correlated subquery: Each promise vs its government's average
-- ============================================================
SELECT 
    p.Title,
    i.Progress_Percentage,
    g.Party_Name,
    (SELECT AVG(i2.Progress_Percentage)
     FROM PROMISE p2
     JOIN IMPLEMENTATION_STATUS i2 ON p2.Promise_ID = i2.Promise_ID
     WHERE p2.Govt_ID = p.Govt_ID
    ) AS Govt_Avg_Progress,
    i.Progress_Percentage - (
        SELECT AVG(i2.Progress_Percentage)
        FROM PROMISE p2
        JOIN IMPLEMENTATION_STATUS i2 ON p2.Promise_ID = i2.Promise_ID
        WHERE p2.Govt_ID = p.Govt_ID
    ) AS Deviation_From_Avg
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
ORDER BY Deviation_From_Avg;

-- ============================================================
-- 5. EXISTS subquery: Governments with at least one completed promise
-- ============================================================
SELECT g.Party_Name, g.Chief_Minister
FROM GOVERNMENT g
WHERE EXISTS (
    SELECT 1
    FROM PROMISE p
    JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
    WHERE p.Govt_ID = g.Govt_ID
      AND i.Status_Type = 'Completed'
);
