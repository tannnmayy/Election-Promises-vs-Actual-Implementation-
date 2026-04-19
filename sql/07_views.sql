-- ============================================================
-- Election Promises vs Actual Implementation
-- 07_views.sql — Views Creation
-- ============================================================

USE election_promises_db;

-- ============================================================
-- View 1: Active Promises Dashboard
-- ============================================================
CREATE OR REPLACE VIEW Active_Promises_Dashboard AS
SELECT 
    p.Promise_ID,
    p.Title,
    g.Party_Name,
    pa.Area_Name AS Policy_Area,
    p.Announcement_Year,
    p.Target_Year,
    p.Budget_Allocated,
    i.Status_Type,
    i.Progress_Percentage,
    i.Last_Updated_Date,
    CASE 
        WHEN i.Progress_Percentage >= 75 THEN 'On Track'
        WHEN i.Progress_Percentage >= 50 THEN 'Moderate'
        ELSE 'At Risk'
    END AS Performance_Rating
FROM PROMISE p
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
JOIN POLICY_AREA pa ON p.PolicyArea_ID = pa.PolicyArea_ID
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
WHERE i.Status_Type IN ('In Progress', 'Not Started');

-- Test View 1
SELECT * FROM Active_Promises_Dashboard;

-- ============================================================
-- View 2: Government Performance Scorecard
-- ============================================================
CREATE OR REPLACE VIEW Government_Performance_Scorecard AS
SELECT 
    g.Govt_ID,
    g.Party_Name,
    g.Chief_Minister,
    g.Start_Year,
    COUNT(DISTINCT p.Promise_ID) AS Total_Promises,
    SUM(CASE WHEN i.Status_Type = 'Completed' THEN 1 ELSE 0 END) AS Completed_Promises,
    SUM(CASE WHEN i.Status_Type = 'Abandoned' THEN 1 ELSE 0 END) AS Abandoned_Promises,
    ROUND(AVG(i.Progress_Percentage), 2) AS Average_Progress,
    SUM(p.Budget_Allocated) AS Total_Budget_Allocated,
    ROUND(
        (SUM(CASE WHEN i.Status_Type = 'Completed' THEN 1 ELSE 0 END) * 100.0) / 
        COUNT(DISTINCT p.Promise_ID), 2
    ) AS Completion_Rate
FROM GOVERNMENT g
LEFT JOIN PROMISE p ON g.Govt_ID = p.Govt_ID
LEFT JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
GROUP BY g.Govt_ID, g.Party_Name, g.Chief_Minister, g.Start_Year;

-- Test View 2
SELECT * FROM Government_Performance_Scorecard;

-- ============================================================
-- View 3: Promise vs Outcome Analysis
-- ============================================================
CREATE OR REPLACE VIEW Promise_Outcome_Analysis AS
SELECT 
    p.Promise_ID,
    p.Title AS Promise_Title,
    g.Party_Name,
    ind.Indicator_Name,
    ind.baseline_value,
    ind.target_value,
    od.Year AS Measurement_Year,
    od.Measured_Value,
    ROUND(
        ((od.Measured_Value - ind.baseline_value) / 
        (ind.target_value - ind.baseline_value)) * 100, 2
    ) AS Target_Achievement_Percentage,
    i.Progress_Percentage AS Promise_Progress,
    i.Status_Type
FROM PROMISE p
JOIN GOVERNMENT g ON p.Govt_ID = g.Govt_ID
JOIN PROMISE_INDICATOR pi ON p.Promise_ID = pi.Promise_ID
JOIN INDICATOR ind ON pi.Indicator_ID = ind.Indicator_ID
LEFT JOIN OUTCOME_DATA od ON ind.Indicator_ID = od.Indicator_ID AND od.Govt_ID = g.Govt_ID
LEFT JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
WHERE od.Year >= p.Announcement_Year;

-- Test View 3
SELECT * FROM Promise_Outcome_Analysis;

-- ============================================================
-- View 4: Policy Area Effectiveness
-- ============================================================
CREATE OR REPLACE VIEW Policy_Area_Effectiveness AS
SELECT 
    pa.PolicyArea_ID,
    pa.Area_Name,
    COUNT(DISTINCT p.Promise_ID) AS Total_Promises,
    COUNT(DISTINCT ind.Indicator_ID) AS Total_Indicators,
    SUM(p.Budget_Allocated) AS Total_Investment,
    AVG(i.Progress_Percentage) AS Avg_Implementation_Progress,
    COUNT(DISTINCT od.Data_ID) AS Outcome_Measurements,
    ROUND(AVG(
        (od.Measured_Value - ind.baseline_value) / 
        NULLIF((ind.target_value - ind.baseline_value), 0) * 100
    ), 2) AS Avg_Outcome_Achievement
FROM POLICY_AREA pa
LEFT JOIN PROMISE p ON pa.PolicyArea_ID = p.PolicyArea_ID
LEFT JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
LEFT JOIN INDICATOR ind ON pa.PolicyArea_ID = ind.PolicyArea_ID
LEFT JOIN OUTCOME_DATA od ON ind.Indicator_ID = od.Indicator_ID
GROUP BY pa.PolicyArea_ID, pa.Area_Name;

-- Test View 4
SELECT * FROM Policy_Area_Effectiveness;
