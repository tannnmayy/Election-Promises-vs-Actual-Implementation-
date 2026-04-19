-- ============================================================
-- Election Promises vs Actual Implementation
-- 09_procedures.sql — Stored Procedures
-- ============================================================

USE election_promises_db;

-- ============================================================
-- Procedure 1: Update Promise Status (with validation & exception handling)
-- ============================================================
DELIMITER //
CREATE PROCEDURE Update_Promise_Status(
    IN p_promise_id INT,
    IN p_new_status VARCHAR(20),
    IN p_new_progress DECIMAL(5,2),
    IN p_remarks TEXT,
    OUT p_result_message VARCHAR(200)
)
BEGIN
    DECLARE v_current_progress DECIMAL(5,2);
    DECLARE v_error_message VARCHAR(200);
    
    -- Exception handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_message = MESSAGE_TEXT;
        SET p_result_message = CONCAT('Error: ', v_error_message);
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Get current progress
    SELECT Progress_Percentage INTO v_current_progress
    FROM IMPLEMENTATION_STATUS
    WHERE Promise_ID = p_promise_id;
    
    -- Validation logic
    IF p_new_status = 'Completed' AND p_new_progress < 100 THEN
        SET p_result_message = 'Error: Completed status requires 100% progress';
        ROLLBACK;
    ELSEIF p_new_status = 'Not Started' AND p_new_progress > 0 THEN
        SET p_result_message = 'Error: Not Started status should have 0% progress';
        ROLLBACK;
    ELSE
        -- Update the status
        UPDATE IMPLEMENTATION_STATUS
        SET Status_Type = p_new_status,
            Progress_Percentage = p_new_progress,
            Last_Updated_Date = CURDATE(),
            Remarks = p_remarks
        WHERE Promise_ID = p_promise_id;
        
        SET p_result_message = 'Status updated successfully';
        COMMIT;
    END IF;
END//
DELIMITER ;

-- Test Procedure 1: Valid update
CALL Update_Promise_Status(1, 'In Progress', 70.00, 'Coverage expanded to 18 districts', @result);
SELECT @result AS Update_Result;

-- Test Procedure 1: Invalid update (should fail validation)
CALL Update_Promise_Status(1, 'Completed', 70.00, 'Trying invalid update', @result);
SELECT @result AS Update_Result;

-- ============================================================
-- Procedure 2: Generate Government Report
-- ============================================================
DELIMITER //
CREATE PROCEDURE Generate_Government_Report(IN govt_id INT)
BEGIN
    -- Summary statistics
    SELECT 
        g.Party_Name,
        g.Chief_Minister,
        COUNT(p.Promise_ID) AS Total_Promises,
        SUM(CASE WHEN i.Status_Type = 'Completed' THEN 1 ELSE 0 END) AS Completed,
        SUM(CASE WHEN i.Status_Type = 'In Progress' THEN 1 ELSE 0 END) AS In_Progress,
        SUM(CASE WHEN i.Status_Type = 'Abandoned' THEN 1 ELSE 0 END) AS Abandoned,
        ROUND(AVG(i.Progress_Percentage), 2) AS Avg_Progress,
        SUM(p.Budget_Allocated) AS Total_Budget
    FROM GOVERNMENT g
    LEFT JOIN PROMISE p ON g.Govt_ID = p.Govt_ID
    LEFT JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
    WHERE g.Govt_ID = govt_id
    GROUP BY g.Govt_ID, g.Party_Name, g.Chief_Minister;
    
    -- Detailed promises
    SELECT 
        p.Title,
        pa.Area_Name,
        p.Budget_Allocated,
        i.Status_Type,
        i.Progress_Percentage,
        i.Last_Updated_Date
    FROM PROMISE p
    JOIN POLICY_AREA pa ON p.PolicyArea_ID = pa.PolicyArea_ID
    JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
    WHERE p.Govt_ID = govt_id
    ORDER BY i.Progress_Percentage DESC;
END//
DELIMITER ;

-- Test Procedure 2
CALL Generate_Government_Report(1);
CALL Generate_Government_Report(2);
