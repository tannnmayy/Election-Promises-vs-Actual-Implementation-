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
