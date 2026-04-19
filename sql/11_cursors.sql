-- ============================================================
-- Election Promises vs Actual Implementation
-- 11_cursors.sql — Cursor-Based Procedures
-- ============================================================

USE election_promises_db;

-- ============================================================
-- Cursor 1: Mark Overdue Promises as Delayed
-- ============================================================
DELIMITER //
CREATE PROCEDURE Mark_Overdue_Promises()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_promise_id INT;
    DECLARE v_target_year INT;
    DECLARE v_current_status VARCHAR(20);
    DECLARE v_update_count INT DEFAULT 0;
    
    -- Cursor declaration
    DECLARE promise_cursor CURSOR FOR
        SELECT p.Promise_ID, p.Target_Year, i.Status_Type
        FROM PROMISE p
        JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
        WHERE p.Target_Year < YEAR(CURDATE())
          AND i.Status_Type NOT IN ('Completed', 'Abandoned');
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN promise_cursor;
    
    read_loop: LOOP
        FETCH promise_cursor INTO v_promise_id, v_target_year, v_current_status;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Update status to Delayed
        UPDATE IMPLEMENTATION_STATUS
        SET Status_Type = 'Delayed',
            Remarks = CONCAT('Overdue since ', v_target_year, '. Previous status: ', v_current_status),
            Last_Updated_Date = CURDATE()
        WHERE Promise_ID = v_promise_id;
        
        SET v_update_count = v_update_count + 1;
    END LOOP;
    
    CLOSE promise_cursor;
    
    SELECT CONCAT('Updated ', v_update_count, ' overdue promises') AS Result;
END//
DELIMITER ;

-- Test Cursor 1
CALL Mark_Overdue_Promises();

-- Verify changes
SELECT p.Title, p.Target_Year, i.Status_Type, i.Remarks
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID;

-- ============================================================
-- Cursor 2: Generate Performance Reports for All Governments
-- ============================================================
DELIMITER //
CREATE PROCEDURE Generate_All_Govt_Performance()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_govt_id INT;
    DECLARE v_party_name VARCHAR(100);
    DECLARE v_avg_progress DECIMAL(5,2);
    DECLARE v_completion_rate DECIMAL(5,2);
    
    DECLARE govt_cursor CURSOR FOR
        SELECT Govt_ID, Party_Name FROM GOVERNMENT;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Create temp table for results
    CREATE TEMPORARY TABLE IF NOT EXISTS Govt_Performance_Report (
        Party_Name VARCHAR(100),
        Avg_Progress DECIMAL(5,2),
        Completion_Rate DECIMAL(5,2),
        Performance_Grade VARCHAR(10)
    );
    
    TRUNCATE TABLE Govt_Performance_Report;
    
    OPEN govt_cursor;
    
    report_loop: LOOP
        FETCH govt_cursor INTO v_govt_id, v_party_name;
        
        IF done THEN
            LEAVE report_loop;
        END IF;
        
        -- Calculate metrics
        SELECT 
            AVG(i.Progress_Percentage),
            (SUM(CASE WHEN i.Status_Type = 'Completed' THEN 1 ELSE 0 END) * 100.0) / COUNT(*)
        INTO v_avg_progress, v_completion_rate
        FROM PROMISE p
        JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
        WHERE p.Govt_ID = v_govt_id;
        
        -- Insert into report
        INSERT INTO Govt_Performance_Report
        VALUES (
            v_party_name,
            COALESCE(v_avg_progress, 0),
            COALESCE(v_completion_rate, 0),
            CASE 
                WHEN v_completion_rate >= 75 THEN 'A'
                WHEN v_completion_rate >= 60 THEN 'B'
                WHEN v_completion_rate >= 40 THEN 'C'
                ELSE 'D'
            END
        );
    END LOOP;
    
    CLOSE govt_cursor;
    
    -- Display report
    SELECT * FROM Govt_Performance_Report ORDER BY Completion_Rate DESC;
    
    DROP TEMPORARY TABLE Govt_Performance_Report;
END//
DELIMITER ;

-- Test Cursor 2
CALL Generate_All_Govt_Performance();
