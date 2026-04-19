-- ============================================================
-- Election Promises vs Actual Implementation
-- 03_queries_aggregate.sql — Aggregate Functions & Constraints
-- ============================================================

USE election_promises_db;

-- ============================================================
-- 1. Count promises by status
-- ============================================================
SELECT 
    Status_Type, 
    COUNT(*) AS Total_Promises
FROM IMPLEMENTATION_STATUS
GROUP BY Status_Type
ORDER BY Total_Promises DESC;

-- ============================================================
-- 2. Average progress by party (HAVING clause)
-- ============================================================
SELECT 
    g.Party_Name, 
    AVG(i.Progress_Percentage) AS Avg_Progress,
    COUNT(p.Promise_ID) AS Total_Promises
FROM GOVERNMENT g
JOIN PROMISE p ON g.Govt_ID = p.Govt_ID
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
GROUP BY g.Party_Name
HAVING AVG(i.Progress_Percentage) > 50
ORDER BY Avg_Progress DESC;

-- ============================================================
-- 3. Total budget allocation by policy area (with AVG, SUM, COUNT)
-- ============================================================
SELECT 
    pa.Area_Name, 
    SUM(p.Budget_Allocated) AS Total_Budget,
    COUNT(p.Promise_ID) AS Promise_Count,
    AVG(p.Budget_Allocated) AS Avg_Budget
FROM POLICY_AREA pa
LEFT JOIN PROMISE p ON pa.PolicyArea_ID = p.PolicyArea_ID
GROUP BY pa.Area_Name
ORDER BY Total_Budget DESC;

-- ============================================================
-- 4. MIN / MAX implementation periods
-- ============================================================
SELECT 
    MIN(Progress_Percentage) AS Min_Progress,
    MAX(Progress_Percentage) AS Max_Progress,
    MIN(Last_Updated_Date) AS Earliest_Update,
    MAX(Last_Updated_Date) AS Latest_Update
FROM IMPLEMENTATION_STATUS;

-- ============================================================
-- 5. Budget statistics per government
-- ============================================================
SELECT 
    g.Party_Name,
    COUNT(p.Promise_ID) AS Promise_Count,
    SUM(p.Budget_Allocated) AS Total_Budget,
    MIN(p.Budget_Allocated) AS Min_Budget,
    MAX(p.Budget_Allocated) AS Max_Budget,
    AVG(p.Budget_Allocated) AS Avg_Budget
FROM GOVERNMENT g
LEFT JOIN PROMISE p ON g.Govt_ID = p.Govt_ID
GROUP BY g.Govt_ID, g.Party_Name
ORDER BY Total_Budget DESC;
