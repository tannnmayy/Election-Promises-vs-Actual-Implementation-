-- ============================================================
-- Election Promises vs Actual Implementation
-- 01_schema.sql — Database & Table Creation
-- ============================================================

-- Create and select the database
CREATE DATABASE IF NOT EXISTS election_promises_db;
USE election_promises_db;

-- ============================================================
-- 1. POLICY_AREA: Categories of government policies
-- ============================================================
CREATE TABLE POLICY_AREA (
    PolicyArea_ID INT PRIMARY KEY AUTO_INCREMENT,
    Area_Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_area_name (Area_Name)
);

-- ============================================================
-- 2. ELECTION: Electoral events
-- ============================================================
CREATE TABLE ELECTION (
    Election_ID INT PRIMARY KEY AUTO_INCREMENT,
    Year INT NOT NULL,
    Type ENUM('General', 'State', 'Local', 'By-election') NOT NULL,
    Total_Seats INT,
    election_date DATE,
    INDEX idx_year (Year)
);

-- ============================================================
-- 3. GOVERNMENT: Governing bodies formed after elections
-- ============================================================
CREATE TABLE GOVERNMENT (
    Govt_ID INT PRIMARY KEY AUTO_INCREMENT,
    Party_Name VARCHAR(100) NOT NULL,
    Chief_Minister VARCHAR(100),
    Start_Year INT NOT NULL,
    End_Year INT,
    Majority_Status ENUM('Majority', 'Coalition', 'Minority') NOT NULL,
    Election_ID INT NOT NULL,
    FOREIGN KEY (Election_ID) REFERENCES ELECTION(Election_ID) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK (End_Year IS NULL OR End_Year >= Start_Year),
    INDEX idx_party (Party_Name),
    INDEX idx_period (Start_Year, End_Year)
);

-- ============================================================
-- 4. PROMISE: Election promises made by governments
-- ============================================================
CREATE TABLE PROMISE (
    Promise_ID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Announcement_Year INT NOT NULL,
    Target_Year INT,
    Govt_ID INT NOT NULL,
    PolicyArea_ID INT NOT NULL,
    Budget_Allocated DECIMAL(15,2),
    Priority_Level ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    FOREIGN KEY (Govt_ID) REFERENCES GOVERNMENT(Govt_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (PolicyArea_ID) REFERENCES POLICY_AREA(PolicyArea_ID) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK (Target_Year >= Announcement_Year),
    INDEX idx_govt_promise (Govt_ID, PolicyArea_ID),
    INDEX idx_year (Announcement_Year, Target_Year)
);

-- ============================================================
-- 5. IMPLEMENTATION_STATUS: Track promise fulfillment
-- ============================================================
CREATE TABLE IMPLEMENTATION_STATUS (
    Status_ID INT PRIMARY KEY AUTO_INCREMENT,
    Promise_ID INT NOT NULL,
    Status_Type ENUM('Not Started', 'In Progress', 'Completed', 'Abandoned', 'Delayed') NOT NULL,
    Progress_Percentage DECIMAL(5,2) DEFAULT 0.00,
    Last_Updated_Date DATE NOT NULL,
    Remarks TEXT,
    verified_by VARCHAR(100),
    FOREIGN KEY (Promise_ID) REFERENCES PROMISE(Promise_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (Progress_Percentage BETWEEN 0 AND 100),
    INDEX idx_promise_status (Promise_ID, Status_Type),
    INDEX idx_updated (Last_Updated_Date)
);

-- ============================================================
-- 6. INDICATOR: Measurable metrics for policy areas
-- ============================================================
CREATE TABLE INDICATOR (
    Indicator_ID INT PRIMARY KEY AUTO_INCREMENT,
    Indicator_Name VARCHAR(150) NOT NULL,
    Unit VARCHAR(50),
    Description TEXT,
    PolicyArea_ID INT NOT NULL,
    baseline_value DECIMAL(15,2),
    target_value DECIMAL(15,2),
    FOREIGN KEY (PolicyArea_ID) REFERENCES POLICY_AREA(PolicyArea_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_policy_indicator (PolicyArea_ID),
    INDEX idx_indicator_name (Indicator_Name)
);

-- ============================================================
-- 7. OUTCOME_DATA: Actual measured outcomes
-- ============================================================
CREATE TABLE OUTCOME_DATA (
    Data_ID INT PRIMARY KEY AUTO_INCREMENT,
    Year INT NOT NULL,
    Measured_Value DECIMAL(15,2) NOT NULL,
    Source VARCHAR(200),
    Measured_Group VARCHAR(100),
    Indicator_ID INT NOT NULL,
    Govt_ID INT NOT NULL,
    verification_status ENUM('Verified', 'Pending', 'Disputed') DEFAULT 'Pending',
    recorded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Indicator_ID) REFERENCES INDICATOR(Indicator_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Govt_ID) REFERENCES GOVERNMENT(Govt_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_year_indicator (Year, Indicator_ID),
    INDEX idx_govt_data (Govt_ID, Year)
);

-- ============================================================
-- 8. PROMISE_INDICATOR: Linking table (Many-to-Many)
-- ============================================================
CREATE TABLE PROMISE_INDICATOR (
    Promise_ID INT NOT NULL,
    Indicator_ID INT NOT NULL,
    Target_Impact VARCHAR(200),
    PRIMARY KEY (Promise_ID, Indicator_ID),
    FOREIGN KEY (Promise_ID) REFERENCES PROMISE(Promise_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Indicator_ID) REFERENCES INDICATOR(Indicator_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 9. PROMISE_AUDIT_LOG: Audit trail for status changes
-- ============================================================
CREATE TABLE PROMISE_AUDIT_LOG (
    Log_ID INT PRIMARY KEY AUTO_INCREMENT,
    Promise_ID INT,
    Action_Type VARCHAR(20),
    Old_Status VARCHAR(20),
    New_Status VARCHAR(20),
    Changed_By VARCHAR(100),
    Changed_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Verification: Show all created tables
-- ============================================================
SHOW TABLES;
-- ============================================================
-- Election Promises vs Actual Implementation
-- 02_sample_data.sql — Sample Data Insertion
-- ============================================================

USE election_promises_db;

-- ============================================================
-- Policy Areas
-- ============================================================
INSERT INTO POLICY_AREA (Area_Name, Description) VALUES
('Healthcare', 'Public health services and medical infrastructure'),
('Education', 'Schools, colleges, and educational programs'),
('Infrastructure', 'Roads, bridges, public transportation'),
('Agriculture', 'Farming support, irrigation, rural development'),
('Employment', 'Job creation and skill development'),
('Environment', 'Pollution control and conservation'),
('Housing', 'Affordable housing and urban development');

-- ============================================================
-- Elections
-- ============================================================
INSERT INTO ELECTION (Year, Type, Total_Seats, election_date) VALUES
(2018, 'General', 234, '2018-05-12'),
(2023, 'General', 234, '2023-05-10'),
(2020, 'State', 140, '2020-11-03');

-- ============================================================
-- Governments
-- ============================================================
INSERT INTO GOVERNMENT (Party_Name, Chief_Minister, Start_Year, End_Year, Majority_Status, Election_ID) VALUES
('Progressive Party', 'Rajesh Kumar', 2018, 2023, 'Majority', 1),
('People\'s Alliance', 'Priya Sharma', 2023, NULL, 'Coalition', 2),
('Regional Front', 'Amit Patel', 2020, NULL, 'Majority', 3);

-- ============================================================
-- Promises
-- ============================================================
INSERT INTO PROMISE (Title, Description, Announcement_Year, Target_Year, Govt_ID, PolicyArea_ID, Budget_Allocated, Priority_Level) VALUES
('Universal Healthcare Coverage', 'Free healthcare for all citizens under poverty line', 2018, 2022, 1, 1, 50000000.00, 'High'),
('Digital Education Initiative', 'Tablets for all high school students', 2018, 2020, 1, 2, 25000000.00, 'High'),
('Metro Rail Expansion', 'Extend metro to 5 new districts', 2023, 2028, 2, 3, 150000000.00, 'High'),
('Farmer Income Doubling', 'Double farmer income through support schemes', 2018, 2023, 1, 4, 75000000.00, 'High'),
('Skill Development Centers', 'Establish 100 skill training centers', 2023, 2025, 2, 5, 30000000.00, 'Medium');

-- ============================================================
-- Indicators
-- ============================================================
INSERT INTO INDICATOR (Indicator_Name, Unit, Description, PolicyArea_ID, baseline_value, target_value) VALUES
('Hospital Beds per 1000', 'beds/1000 people', 'Number of hospital beds available', 1, 1.2, 3.0),
('Literacy Rate', '%', 'Percentage of literate population', 2, 68.5, 85.0),
('Road Quality Index', 'score', 'Road condition rating (0-100)', 3, 45.0, 75.0),
('Average Farmer Income', 'INR/year', 'Annual income of farmers', 4, 75000.00, 150000.00),
('Youth Employment Rate', '%', 'Percentage of employed youth (18-25)', 5, 42.0, 65.0);

-- ============================================================
-- Implementation Status
-- ============================================================
INSERT INTO IMPLEMENTATION_STATUS (Promise_ID, Status_Type, Progress_Percentage, Last_Updated_Date, Remarks) VALUES
(1, 'In Progress', 65.00, '2023-12-15', 'Coverage expanded to 15 districts'),
(2, 'Completed', 100.00, '2021-03-20', 'All students received tablets'),
(3, 'In Progress', 25.00, '2024-01-10', 'Land acquisition in progress'),
(4, 'Completed', 95.00, '2023-11-30', 'Income increased by 89% on average'),
(5, 'In Progress', 40.00, '2024-02-05', '40 centers operational');

-- ============================================================
-- Outcome Data
-- ============================================================
INSERT INTO OUTCOME_DATA (Year, Measured_Value, Source, Measured_Group, Indicator_ID, Govt_ID, verification_status) VALUES
(2019, 1.5, 'Health Ministry Report', 'National', 1, 1, 'Verified'),
(2021, 2.2, 'Health Ministry Report', 'National', 1, 1, 'Verified'),
(2020, 75.2, 'Census Department', 'National', 2, 1, 'Verified'),
(2023, 79.8, 'Education Survey', 'National', 2, 1, 'Verified'),
(2019, 82000.00, 'Agriculture Census', 'Rural', 4, 1, 'Verified'),
(2023, 142000.00, 'Agriculture Census', 'Rural', 4, 1, 'Verified');

-- ============================================================
-- Promise ↔ Indicator Links
-- ============================================================
INSERT INTO PROMISE_INDICATOR (Promise_ID, Indicator_ID, Target_Impact) VALUES
(1, 1, 'Increase hospital bed availability'),
(2, 2, 'Improve digital literacy'),
(4, 4, 'Directly increase farmer income'),
(5, 5, 'Improve youth employability');

-- ============================================================
-- Verification: Count rows in each table
-- ============================================================
SELECT 'POLICY_AREA' AS TableName, COUNT(*) AS RowCount FROM POLICY_AREA
UNION ALL SELECT 'ELECTION', COUNT(*) FROM ELECTION
UNION ALL SELECT 'GOVERNMENT', COUNT(*) FROM GOVERNMENT
UNION ALL SELECT 'PROMISE', COUNT(*) FROM PROMISE
UNION ALL SELECT 'INDICATOR', COUNT(*) FROM INDICATOR
UNION ALL SELECT 'IMPLEMENTATION_STATUS', COUNT(*) FROM IMPLEMENTATION_STATUS
UNION ALL SELECT 'OUTCOME_DATA', COUNT(*) FROM OUTCOME_DATA
UNION ALL SELECT 'PROMISE_INDICATOR', COUNT(*) FROM PROMISE_INDICATOR;
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
-- ============================================================
-- Election Promises vs Actual Implementation
-- 14_indexing.sql — Indexing Strategy & Performance
-- ============================================================

USE election_promises_db;

-- ============================================================
-- Check existing indexes on core tables
-- ============================================================
SHOW INDEXES FROM PROMISE;
SHOW INDEXES FROM IMPLEMENTATION_STATUS;
SHOW INDEXES FROM OUTCOME_DATA;

-- ============================================================
-- Performance analysis with EXPLAIN
-- ============================================================
EXPLAIN SELECT * FROM PROMISE WHERE Announcement_Year = 2018;
EXPLAIN SELECT * FROM IMPLEMENTATION_STATUS WHERE Status_Type = 'Completed';
EXPLAIN SELECT p.Title, i.Status_Type 
        FROM PROMISE p 
        JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID;

-- ============================================================
-- Add composite indexes for common query patterns
-- ============================================================
CREATE INDEX idx_promise_govt_area 
    ON PROMISE(Govt_ID, PolicyArea_ID, Announcement_Year);

CREATE INDEX idx_status_progress 
    ON IMPLEMENTATION_STATUS(Status_Type, Progress_Percentage);

CREATE INDEX idx_outcome_year_indicator 
    ON OUTCOME_DATA(Year, Indicator_ID, Govt_ID);

-- ============================================================
-- Full-text search index
-- ============================================================
ALTER TABLE PROMISE ADD FULLTEXT INDEX ft_title_desc (Title, Description);

-- Full-text search usage
SELECT Promise_ID, Title, Description
FROM PROMISE
WHERE MATCH(Title, Description) AGAINST('healthcare education' IN NATURAL LANGUAGE MODE);

-- Boolean mode search
SELECT Promise_ID, Title, Description
FROM PROMISE
WHERE MATCH(Title, Description) AGAINST('+healthcare -metro' IN BOOLEAN MODE);

-- ============================================================
-- Verify new indexes
-- ============================================================
SHOW INDEXES FROM PROMISE;

-- ============================================================
-- Performance comparison: Before and after indexing
-- ============================================================
-- With the new composite index:
EXPLAIN SELECT p.Title, i.Status_Type, i.Progress_Percentage
FROM PROMISE p
JOIN IMPLEMENTATION_STATUS i ON p.Promise_ID = i.Promise_ID
WHERE p.Govt_ID = 1 AND p.PolicyArea_ID = 1;

-- With the status+progress index:
EXPLAIN SELECT * FROM IMPLEMENTATION_STATUS
WHERE Status_Type = 'In Progress' AND Progress_Percentage > 50;
