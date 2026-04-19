-- ============================================================
-- Election Promises vs Actual Implementation
-- 13_concurrency.sql — Concurrency Control & Transactions
-- ============================================================

USE election_promises_db;

-- ============================================================
-- Transaction Procedure: Update promise with rollback capability
-- ============================================================
DELIMITER //
CREATE PROCEDURE Update_Promise_With_Transaction(
    IN p_promise_id INT,
    IN p_new_budget DECIMAL(15,2),
    IN p_new_progress DECIMAL(5,2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Transaction rolled back due to error' AS Result;
    END;
    
    START TRANSACTION;
    
    -- Update promise budget
    UPDATE PROMISE
    SET Budget_Allocated = p_new_budget
    WHERE Promise_ID = p_promise_id;
    
    -- Update implementation status
    UPDATE IMPLEMENTATION_STATUS
    SET Progress_Percentage = p_new_progress,
        Last_Updated_Date = CURDATE()
    WHERE Promise_ID = p_promise_id;
    
    COMMIT;
    SELECT 'Transaction completed successfully' AS Result;
END//
DELIMITER ;

-- Test the procedure
CALL Update_Promise_With_Transaction(1, 55000000.00, 70.00);

-- ============================================================
-- ISOLATION LEVEL DEMONSTRATIONS
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. READ UNCOMMITTED (Dirty Reads possible)
-- ────────────────────────────────────────────────────────────
-- Session 1:
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
START TRANSACTION;
SELECT * FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 1;
-- At this level, other sessions CAN see uncommitted changes (dirty reads)
COMMIT;

-- ────────────────────────────────────────────────────────────
-- 2. READ COMMITTED (No Dirty Reads)
-- ────────────────────────────────────────────────────────────
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT * FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 1;
-- Only sees committed data from other sessions
COMMIT;

-- ────────────────────────────────────────────────────────────
-- 3. REPEATABLE READ (MySQL default — No Phantom Reads in InnoDB)
-- ────────────────────────────────────────────────────────────
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
SELECT * FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 1;
-- Same query returns identical results even if other sessions commit changes
COMMIT;

-- ────────────────────────────────────────────────────────────
-- 4. SERIALIZABLE (Strictest — full locking)
-- ────────────────────────────────────────────────────────────
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;
SELECT * FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 1;
-- Prevents ALL concurrency anomalies; shared locks on reads
COMMIT;

-- Reset to default
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- ============================================================
-- ROLLBACK DEMONSTRATION
-- ============================================================
START TRANSACTION;

-- Save current state
SELECT 'Before update:' AS Label;
SELECT Progress_Percentage FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 3;

-- Make a change
UPDATE IMPLEMENTATION_STATUS SET Progress_Percentage = 99.99 WHERE Promise_ID = 3;

-- See changed value (within same transaction)
SELECT 'After update (before rollback):' AS Label;
SELECT Progress_Percentage FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 3;

-- Rollback the change
ROLLBACK;

-- Value is restored
SELECT 'After rollback:' AS Label;
SELECT Progress_Percentage FROM IMPLEMENTATION_STATUS WHERE Promise_ID = 3;

-- ============================================================
-- SAVEPOINT DEMONSTRATION
-- ============================================================
START TRANSACTION;

UPDATE PROMISE SET Budget_Allocated = 60000000.00 WHERE Promise_ID = 1;
SAVEPOINT sp1;

UPDATE PROMISE SET Budget_Allocated = 80000000.00 WHERE Promise_ID = 2;
SAVEPOINT sp2;

UPDATE PROMISE SET Budget_Allocated = 200000000.00 WHERE Promise_ID = 3;

-- Rollback only the last update
ROLLBACK TO sp2;

COMMIT;

-- Verify: Promise 1 & 2 changed, Promise 3 unchanged
SELECT Promise_ID, Title, Budget_Allocated FROM PROMISE WHERE Promise_ID IN (1,2,3);

-- ============================================================
-- DEADLOCK SCENARIO (for demonstration — run in two sessions)
-- ============================================================
-- Session 1:
-- START TRANSACTION;
-- UPDATE PROMISE SET Budget_Allocated = 1000000 WHERE Promise_ID = 1;
-- -- Wait, then:
-- UPDATE IMPLEMENTATION_STATUS SET Progress_Percentage = 50 WHERE Promise_ID = 2;
-- COMMIT;

-- Session 2 (simultaneously):
-- START TRANSACTION;
-- UPDATE IMPLEMENTATION_STATUS SET Progress_Percentage = 60 WHERE Promise_ID = 2;
-- -- Wait, then:
-- UPDATE PROMISE SET Budget_Allocated = 2000000 WHERE Promise_ID = 1;
-- COMMIT;
-- → One transaction will be chosen as the deadlock victim and rolled back by MySQL
