-- ============================================================
-- Election Promises vs Actual Implementation
-- 08_functions.sql — Stored Functions
-- ============================================================

USE election_promises_db;

-- ============================================================
-- Function 1: Calculate Promise Fulfillment Rate for a Government
-- ============================================================
DELIMITER //
CREATE FUNCTION Calculate_Fulfillment_Rate(govt_id INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total_promises INT;
    DECLARE completed_promises INT;
    DECLARE fulfillment_rate DECIMAL(5,2);
    
    SELECT COUNT(*) INTO total_promises
    FROM PROMISE
    WHERE Govt_ID = govt_id;
    
    IF total_promises = 0 THEN
        RETURN 0.00;
    END IF;
    
    SELECT COUNT(*) INTO completed_promises
    FROM PROMISE p
    JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
    WHERE p.Govt_ID = govt_id AND i.Status_Type = 'Completed';
    
    SET fulfillment_rate = (completed_promises * 100.0) / total_promises;
    
    RETURN fulfillment_rate;
END//
DELIMITER ;

-- Test Function 1
SELECT 
    g.Party_Name,
    Calculate_Fulfillment_Rate(g.Govt_ID) AS Fulfillment_Rate
FROM GOVERNMENT g;

-- ============================================================
-- Function 2: Get Promise Status Category
-- ============================================================
DELIMITER //
CREATE FUNCTION Get_Status_Category(progress_pct DECIMAL(5,2))
RETURNS VARCHAR(20)
DETERMINISTIC
NO SQL
BEGIN
    DECLARE category VARCHAR(20);
    
    IF progress_pct >= 90 THEN
        SET category = 'Excellent';
    ELSEIF progress_pct >= 75 THEN
        SET category = 'Good';
    ELSEIF progress_pct >= 50 THEN
        SET category = 'Average';
    ELSEIF progress_pct >= 25 THEN
        SET category = 'Poor';
    ELSE
        SET category = 'Critical';
    END IF;
    
    RETURN category;
END//
DELIMITER ;

-- Test Function 2
SELECT 
    p.Title,
    i.Progress_Percentage,
    Get_Status_Category(i.Progress_Percentage) AS Category
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID;

-- ============================================================
-- Function 3: Calculate Budget Utilization Efficiency
-- ============================================================
DELIMITER //
CREATE FUNCTION Calculate_Budget_Efficiency(promise_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE budget DECIMAL(15,2);
    DECLARE progress DECIMAL(5,2);
    DECLARE efficiency DECIMAL(10,2);
    
    SELECT p.Budget_Allocated, i.Progress_Percentage
    INTO budget, progress
    FROM PROMISE p
    JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
    WHERE p.Promise_ID = promise_id;
    
    IF budget IS NULL OR budget = 0 THEN
        RETURN 0.00;
    END IF;
    
    -- Efficiency = Progress achieved per million spent
    SET efficiency = (progress / budget) * 1000000;
    
    RETURN ROUND(efficiency, 2);
END//
DELIMITER ;

-- Test Function 3
SELECT 
    p.Title,
    p.Budget_Allocated,
    i.Progress_Percentage,
    Calculate_Budget_Efficiency(p.Promise_ID) AS Efficiency_Score
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID;
