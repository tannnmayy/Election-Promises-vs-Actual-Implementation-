-- ============================================================
-- Election Promises vs Actual Implementation
-- 05_queries_joins.sql — Multiple Join Types
-- ============================================================

USE election_promises_db;

-- ============================================================
-- 1. INNER JOIN: Complete promise analysis
-- ============================================================
SELECT 
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
ORDER BY i.Progress_Percentage DESC;

-- ============================================================
-- 2. LEFT JOIN: All promises with optional outcome data
-- ============================================================
SELECT 
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
ORDER BY p.Title, od.Year;

-- ============================================================
-- 3. RIGHT JOIN: All policy areas, including those without promises
-- ============================================================
SELECT 
    pa.Area_Name,
    p.Title AS Promise_Title,
    p.Budget_Allocated
FROM PROMISE p
RIGHT JOIN POLICY_AREA pa ON p.PolicyArea_ID = pa.PolicyArea_ID
ORDER BY pa.Area_Name;

-- ============================================================
-- 4. CROSS JOIN: Government comparison matrix
-- ============================================================
SELECT 
    g1.Party_Name AS Gov1,
    g2.Party_Name AS Gov2,
    AVG(i1.Progress_Percentage) AS Gov1_Avg,
    AVG(i2.Progress_Percentage) AS Gov2_Avg
FROM GOVERNMENT g1
CROSS JOIN GOVERNMENT g2
LEFT JOIN PROMISE p1 ON g1.Govt_ID = p1.Govt_ID
LEFT JOIN PROMISE p2 ON g2.Govt_ID = p2.Govt_ID
LEFT JOIN IMPLEMENTATION_STATUS i1 ON p1.Promise_ID = i1.Promise_ID
LEFT JOIN IMPLEMENTATION_STATUS i2 ON p2.Promise_ID = i2.Promise_ID
WHERE g1.Govt_ID < g2.Govt_ID
GROUP BY g1.Party_Name, g2.Party_Name;

-- ============================================================
-- 5. SELF JOIN: Compare promises within the same government
-- ============================================================
SELECT 
    p1.Title AS Promise_1,
    p2.Title AS Promise_2,
    p1.Budget_Allocated AS Budget_1,
    p2.Budget_Allocated AS Budget_2,
    g.Party_Name
FROM PROMISE p1
JOIN PROMISE p2 ON p1.Govt_ID = p2.Govt_ID AND p1.Promise_ID < p2.Promise_ID
JOIN GOVERNMENT g ON p1.Govt_ID = g.Govt_ID
ORDER BY g.Party_Name;

-- ============================================================
-- 6. NATURAL JOIN demonstration
-- ============================================================
SELECT *
FROM PROMISE
NATURAL JOIN IMPLEMENTATION_STATUS
LIMIT 10;
