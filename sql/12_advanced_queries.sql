-- ============================================================
-- Election Promises vs Actual Implementation
-- 12_advanced_queries.sql — Window Functions & Analytics
-- ============================================================

USE election_promises_db;

-- ============================================================
-- 1. Window Functions: Rank governments by performance
-- ============================================================
SELECT 
    Party_Name,
    Average_Progress,
    Completion_Rate,
    RANK() OVER (ORDER BY Completion_Rate DESC) AS Performance_Rank,
    DENSE_RANK() OVER (ORDER BY Average_Progress DESC) AS Progress_Rank,
    ROW_NUMBER() OVER (ORDER BY Completion_Rate DESC) AS Row_Num
FROM Government_Performance_Scorecard;

-- ============================================================
-- 2. Cumulative budget allocation over time
-- ============================================================
SELECT 
    Announcement_Year,
    SUM(Budget_Allocated) AS Year_Budget,
    SUM(SUM(Budget_Allocated)) OVER (ORDER BY Announcement_Year) AS Cumulative_Budget
FROM PROMISE
GROUP BY Announcement_Year
ORDER BY Announcement_Year;

-- ============================================================
-- 3. Moving average of progress
-- ============================================================
SELECT 
    p.Promise_ID,
    p.Title,
    i.Progress_Percentage,
    AVG(i.Progress_Percentage) OVER (
        ORDER BY i.Last_Updated_Date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS Moving_Avg_Progress
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
ORDER BY i.Last_Updated_Date;

-- ============================================================
-- 4. Comparative analysis: Promises vs Outcomes
-- ============================================================
SELECT 
    pa.Area_Name,
    COUNT(DISTINCT p.Promise_ID) AS Total_Promises,
    COUNT(DISTINCT od.Data_ID) AS Outcome_Records,
    ROUND(AVG(i.Progress_Percentage), 2) AS Avg_Promise_Progress,
    ROUND(AVG(
        ((od.Measured_Value - ind.baseline_value) / 
        NULLIF((ind.target_value - ind.baseline_value), 0)) * 100
    ), 2) AS Avg_Indicator_Achievement,
    CASE 
        WHEN AVG(i.Progress_Percentage) > AVG(
            ((od.Measured_Value - ind.baseline_value) / 
            NULLIF((ind.target_value - ind.baseline_value), 0)) * 100
        ) THEN 'Over-reporting'
        WHEN AVG(i.Progress_Percentage) < AVG(
            ((od.Measured_Value - ind.baseline_value) / 
            NULLIF((ind.target_value - ind.baseline_value), 0)) * 100
        ) THEN 'Under-reporting'
        ELSE 'Accurate'
    END AS Reporting_Accuracy
FROM POLICY_AREA pa
LEFT JOIN PROMISE p ON pa.PolicyArea_ID = p.PolicyArea_ID
LEFT JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
LEFT JOIN INDICATOR ind ON pa.PolicyArea_ID = ind.PolicyArea_ID
LEFT JOIN OUTCOME_DATA od ON ind.Indicator_ID = od.Indicator_ID
GROUP BY pa.Area_Name
HAVING COUNT(DISTINCT p.Promise_ID) > 0;

-- ============================================================
-- 5. Identify underperforming promises needing attention
-- ============================================================
SELECT 
    p.Promise_ID,
    p.Title,
    g.Party_Name,
    p.Announcement_Year,
    p.Target_Year,
    YEAR(CURDATE()) - p.Announcement_Year AS Years_Elapsed,
    i.Progress_Percentage,
    (100.0 / NULLIF((p.Target_Year - p.Announcement_Year), 0)) * 
    (YEAR(CURDATE()) - p.Announcement_Year) AS Expected_Progress,
    i.Progress_Percentage - (
        (100.0 / NULLIF((p.Target_Year - p.Announcement_Year), 0)) * 
        (YEAR(CURDATE()) - p.Announcement_Year)
    ) AS Progress_Gap,
    CASE 
        WHEN i.Progress_Percentage < (
            (100.0 / NULLIF((p.Target_Year - p.Announcement_Year), 0)) * 
            (YEAR(CURDATE()) - p.Announcement_Year)
        ) THEN 'Behind Schedule'
        WHEN i.Progress_Percentage > (
            (100.0 / NULLIF((p.Target_Year - p.Announcement_Year), 0)) * 
            (YEAR(CURDATE()) - p.Announcement_Year)
        ) THEN 'Ahead of Schedule'
        ELSE 'On Track'
    END AS Schedule_Status
FROM PROMISE p
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
WHERE p.Target_Year IS NOT NULL
  AND i.Status_Type != 'Completed'
ORDER BY Progress_Gap;

-- ============================================================
-- 6. Percentile ranking of promises by budget
-- ============================================================
SELECT 
    p.Title,
    p.Budget_Allocated,
    PERCENT_RANK() OVER (ORDER BY p.Budget_Allocated) AS Budget_Percentile,
    NTILE(4) OVER (ORDER BY p.Budget_Allocated) AS Budget_Quartile
FROM PROMISE p
ORDER BY p.Budget_Allocated DESC;
