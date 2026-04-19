-- ============================================================
-- Election Promises vs Actual Implementation
-- 10_triggers.sql — Triggers
-- ============================================================

USE election_promises_db;

-- ============================================================
-- Trigger 1: Auto-update timestamp on status change
-- ============================================================
DELIMITER //
CREATE TRIGGER trg_update_timestamp
BEFORE UPDATE ON IMPLEMENTATION_STATUS
FOR EACH ROW
BEGIN
    IF NEW.Status_Type != OLD.Status_Type OR 
       NEW.Progress_Percentage != OLD.Progress_Percentage THEN
        SET NEW.Last_Updated_Date = CURDATE();
    END IF;
END//
DELIMITER ;

-- ============================================================
-- Trigger 2: Validate progress percentage on INSERT
-- ============================================================
DELIMITER //
CREATE TRIGGER trg_validate_progress
BEFORE INSERT ON IMPLEMENTATION_STATUS
FOR EACH ROW
BEGIN
    IF NEW.Progress_Percentage < 0 OR NEW.Progress_Percentage > 100 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Progress percentage must be between 0 and 100';
    END IF;
    
    IF NEW.Status_Type = 'Completed' AND NEW.Progress_Percentage < 100 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Completed status requires 100% progress';
    END IF;
END//
DELIMITER ;

-- ============================================================
-- Trigger 3: Log status changes to PROMISE_AUDIT_LOG
-- (PROMISE_AUDIT_LOG table was created in 01_schema.sql)
-- ============================================================
DELIMITER //
CREATE TRIGGER trg_log_status_change
AFTER UPDATE ON IMPLEMENTATION_STATUS
FOR EACH ROW
BEGIN
    IF NEW.Status_Type != OLD.Status_Type THEN
        INSERT INTO PROMISE_AUDIT_LOG (
            Promise_ID, Action_Type, Old_Status, New_Status, Changed_By
        )
        VALUES (
            NEW.Promise_ID, 'STATUS_CHANGE', 
            OLD.Status_Type, NEW.Status_Type, USER()
        );
    END IF;
END//
DELIMITER ;

-- ============================================================
-- Trigger 4: Prevent deletion of promises with associated outcome data
-- ============================================================
DELIMITER //
CREATE TRIGGER trg_prevent_promise_deletion
BEFORE DELETE ON PROMISE
FOR EACH ROW
BEGIN
    DECLARE outcome_count INT;
    
    SELECT COUNT(*) INTO outcome_count
    FROM PROMISE_INDICATOR pi
    JOIN OUTCOME_DATA od ON pi.Indicator_ID = od.Indicator_ID
    WHERE pi.Promise_ID = OLD.Promise_ID;
    
    IF outcome_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete promise with associated outcome data';
    END IF;
END//
DELIMITER ;

-- ============================================================
-- Test Triggers
-- ============================================================

-- Test Trigger 1: Update status → timestamp auto-updates
UPDATE IMPLEMENTATION_STATUS 
SET Progress_Percentage = 68.00 
WHERE Promise_ID = 1;

SELECT Promise_ID, Progress_Percentage, Last_Updated_Date 
FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 1;

-- Test Trigger 3: Status change → audit log entry
UPDATE IMPLEMENTATION_STATUS 
SET Status_Type = 'Delayed', Progress_Percentage = 68.00 
WHERE Promise_ID = 1;

SELECT * FROM PROMISE_AUDIT_LOG;

-- Revert for consistency
UPDATE IMPLEMENTATION_STATUS 
SET Status_Type = 'In Progress', Progress_Percentage = 65.00 
WHERE Promise_ID = 1;
