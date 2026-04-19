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
