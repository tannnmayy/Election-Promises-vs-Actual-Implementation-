-- ============================================================
-- Election Promises vs Actual Implementation
-- 02_sample_data.sql — Expanded Dataset
-- ============================================================

USE election_promises_db;

-- Clear existing data (optional, but good for fresh start)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE PROMISE_INDICATOR;
TRUNCATE TABLE OUTCOME_DATA;
TRUNCATE TABLE INDICATOR;
TRUNCATE TABLE IMPLEMENTATION_STATUS;
TRUNCATE TABLE PROMISE;
TRUNCATE TABLE GOVERNMENT;
TRUNCATE TABLE ELECTION;
TRUNCATE TABLE POLICY_AREA;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. POLICY_AREA
INSERT INTO POLICY_AREA (Area_Name, Description, Priority_Score) VALUES
('Healthcare', 'Public health services and medical infrastructure', 10),
('Education', 'Schools, colleges, and educational programs', 9),
('Infrastructure', 'Roads, bridges, public transportation', 8),
('Agriculture', 'Farming support, irrigation, rural development', 9),
('Employment', 'Job creation and skill development', 8),
('Environment', 'Pollution control and conservation', 7),
('Housing', 'Affordable housing and urban development', 7),
('Technology', 'Digital infrastructure and IT sector growth', 6),
('Tourism', 'Promotion of heritage and leisure travel', 4),
('Energy', 'Power generation and renewable resources', 8),
('Security', 'Law and order and internal safety', 9),
('Finance', 'Fiscal management and banking reforms', 7);

-- 2. ELECTION
INSERT INTO ELECTION (Year, Type, Total_Seats, election_date) VALUES
(2014, 'General', 234, '2014-05-15'),
(2018, 'General', 234, '2018-05-12'),
(2023, 'General', 234, '2023-05-10'),
(2015, 'State', 140, '2015-11-20'),
(2020, 'State', 140, '2020-11-03'),
(2021, 'Local', 500, '2021-09-25');

-- 3. GOVERNMENT
INSERT INTO GOVERNMENT (Party_Name, Chief_Minister, Start_Year, End_Year, Majority_Status, Ideology, Budget_Total_Cr, Election_ID) VALUES
('Progressive Party', 'Rajesh Kumar', 2018, 2023, 'Majority', 'Social Democracy', 150000.00, 2),
('People\'s Alliance', 'Priya Sharma', 2023, NULL, 'Coalition', 'Centrist', 180000.00, 3),
('Regional Front', 'Amit Patel', 2020, NULL, 'Majority', 'Regionalism', 95000.00, 5),
('United Democratic Party', 'S. Jayaraman', 2014, 2018, 'Coalition', 'Conservative', 120000.00, 1),
('National Heritage Party', 'Meera Singh', 2015, 2020, 'Majority', 'Right-wing', 85000.00, 4);

-- 4. PROMISE
INSERT INTO PROMISE (Title, Description, Announcement_Year, Target_Year, Govt_ID, PolicyArea_ID, Budget_Allocated, Priority_Level, Impact_Type, Complexity) VALUES
('Universal Healthcare Coverage', 'Free healthcare for all citizens under poverty line', 2018, 2022, 1, 1, 50000000.00, 'High', 'Social', 'Complex'),
('Digital Education Initiative', 'Tablets for all high school students', 2018, 2020, 1, 2, 25000000.00, 'High', 'Social', 'Moderate'),
('Farmer Income Doubling', 'Double farmer income through support schemes', 2018, 2023, 1, 4, 75000000.00, 'High', 'Economic', 'Complex'),
('Smart City Project Alpha', 'Development of tech hubs in 5 cities', 2018, 2024, 1, 8, 45000000.00, 'Medium', 'Infrastructure', 'Complex'),
('River Cleaning Mission', 'Total cleanup of the major state river', 2018, 2023, 1, 6, 12000000.00, 'Medium', 'Environmental', 'Complex'),
('Women Safety App', 'Centralized emergency response system', 2019, 2020, 1, 11, 2000000.00, 'High', 'Social', 'Simple'),
('Public Transport Electrification', 'Replace 50% of city buses with EVs', 2019, 2023, 1, 3, 35000000.00, 'High', 'Environmental', 'Moderate'),
('Metro Rail Expansion', 'Extend metro to 5 new districts', 2023, 2028, 2, 3, 150000000.00, 'High', 'Infrastructure', 'Complex'),
('Skill Development Centers', 'Establish 100 skill training centers', 2023, 2025, 2, 5, 30000000.00, 'Medium', 'Economic', 'Moderate'),
('Rural Wi-Fi Mission', 'Free internet in all gram panchayats', 2023, 2026, 2, 8, 15000000.00, 'Medium', 'Economic', 'Moderate'),
('Affordable Housing Scheme 2.0', '1 million new low-cost homes', 2023, 2027, 2, 7, 85000000.00, 'High', 'Social', 'Complex'),
('Green Energy Corridor', 'Solar farms generating 2GW power', 2023, 2026, 2, 10, 60000000.00, 'High', 'Environmental', 'Complex'),
('Tourism Circuit Development', 'Connecting 10 heritage sites', 2023, 2025, 2, 9, 8000000.00, 'Low', 'Economic', 'Simple'),
('Startup Seed Fund', 'Interest-free loans for new ventures', 2023, 2024, 2, 12, 10000000.00, 'Medium', 'Economic', 'Moderate'),
('Tribal Area Connectivity', 'All-weather roads to remote villages', 2020, 2024, 3, 3, 28000000.00, 'High', 'Infrastructure', 'Moderate'),
('Local Language Schools', '300 new schools teaching in native tongue', 2020, 2023, 3, 2, 18000000.00, 'Medium', 'Social', 'Simple'),
('Water Harvesting Mandate', 'Compulsory systems in all govt buildings', 2021, 2022, 3, 6, 5000000.00, 'Medium', 'Environmental', 'Simple'),
('Regional Film Studio', 'State-of-the-art facility for local cinema', 2021, 2024, 3, 9, 12000000.00, 'Low', 'Social', 'Moderate'),
('Old Age Pension Hike', 'Increase pension by 50% for 70+', 2014, 2015, 4, 1, 22000000.00, 'High', 'Social', 'Simple'),
('Highway Corridor Phase 1', 'Linking major industrial zones', 2014, 2018, 4, 3, 95000000.00, 'High', 'Infrastructure', 'Complex'),
('Port Modernization', 'Deepen draft and automate terminals', 2015, 2019, 4, 3, 65000000.00, 'Medium', 'Economic', 'Complex'),
('National Game Village', 'Hosting regional sports meet infrastructure', 2015, 2017, 4, 1, 15000000.00, 'Low', 'Social', 'Moderate'),
('Coastal Belt Protection', 'Sea walls and mangrove plantation', 2019, 2024, 1, 6, 18000000.00, 'Medium', 'Environmental', 'Moderate'),
('Primary School Mid-day Meals', 'Hot cooked meals for all primary students', 2018, 2019, 1, 2, 32000000.00, 'High', 'Social', 'Moderate'),
('Industrial Park Development', 'Special zones for electronics manufacturing', 2023, 2027, 2, 12, 75000000.00, 'High', 'Economic', 'Complex'),
('Mental Health Clinics', 'District-level counseling centers', 2023, 2025, 2, 1, 14000000.00, 'Medium', 'Social', 'Moderate'),
('Cyber Security Lab', 'State-level unit for threat detection', 2020, 2021, 3, 11, 8000000.00, 'High', 'Security', 'Simple'),
('Dairy Farming Subsidy', 'Low-interest loans for cattle purchase', 2020, 2022, 3, 4, 11000000.00, 'Medium', 'Economic', 'Simple'),
('Urban Forest Parks', 'Creating green lungs in metropolitan areas', 2015, 2018, 5, 6, 9000000.00, 'Low', 'Environmental', 'Simple'),
('Police Modernization', 'New fleet and advanced forensic tools', 2015, 2020, 5, 11, 24000000.00, 'High', 'Security', 'Moderate'),
('Solar Rooftop Subsidy', 'Subsidizing 40% of home solar costs', 2023, 2026, 2, 10, 19000000.00, 'Medium', 'Environmental', 'Simple'),
('Zero Plastic Initiative', 'Total ban and alternative support', 2018, 2022, 1, 6, 4000000.00, 'High', 'Environmental', 'Moderate'),
('Public Library Network', 'Digital libraries in every block', 2014, 2017, 4, 2, 7000000.00, 'Low', 'Social', 'Simple'),
('Bridge Over River Z', 'Major suspension bridge project', 2014, 2019, 4, 3, 82000000.00, 'High', 'Infrastructure', 'Complex'),
('Vocational Training for Youth', 'Short-term certified courses', 2015, 2016, 5, 5, 13000000.00, 'Medium', 'Economic', 'Simple'),
('Organic Farming Promotion', 'Certification support and organic hubs', 2023, 2025, 2, 4, 9000000.00, 'Medium', 'Environmental', 'Moderate');

-- 5. IMPLEMENTATION_STATUS
INSERT INTO IMPLEMENTATION_STATUS (Promise_ID, Status_Type, Progress_Percentage, Last_Updated_Date, Remarks, verified_by) VALUES
(1, 'In Progress', 78.00, '2023-12-15', 'Coverage expanded to 22 districts', 'Health Inspector'),
(2, 'Completed', 100.00, '2021-03-20', 'All students received tablets', 'Education Board'),
(3, 'Completed', 92.00, '2023-11-30', 'Target achieved in 90% of blocks', 'Agri Audit'),
(4, 'In Progress', 65.00, '2024-01-10', '3 cities fully operational', 'Urban Dev'),
(5, 'Delayed', 45.00, '2023-10-05', 'High rains affected cleanup', 'Env Agency'),
(6, 'Completed', 100.00, '2020-05-12', 'App launched and live', 'Police Dept'),
(7, 'In Progress', 85.00, '2024-02-18', '700 buses converted', 'Transport Dept'),
(8, 'In Progress', 15.00, '2024-03-01', 'Tunneling started in Phase 1', 'Metro Corp'),
(9, 'In Progress', 55.00, '2024-02-05', '55 centers operational', 'Skill Board'),
(10, 'In Progress', 30.00, '2024-01-20', 'Laying of fiber optic cables', 'IT Ministry'),
(11, 'Not Started', 0.00, '2023-06-01', 'Planning and land survey', 'Housing Board'),
(12, 'In Progress', 22.00, '2024-02-15', 'First 500MW plant commissioned', 'Energy Dept'),
(13, 'Completed', 100.00, '2024-01-10', 'Circuit fully connected', 'Tourism Board'),
(14, 'In Progress', 90.00, '2024-03-05', '900 startups funded', 'Finance Dept'),
(15, 'In Progress', 72.00, '2023-11-15', '60% roads completed', 'PWD'),
(16, 'Completed', 100.00, '2023-04-20', 'All schools operational', 'Education Dept'),
(17, 'Completed', 100.00, '2022-09-10', 'Target achieved', 'Env Agency'),
(18, 'In Progress', 40.00, '2024-01-05', 'Main studio block ready', 'Culture Dept'),
(19, 'Completed', 100.00, '2015-12-10', 'Pension disbursed', 'Social Welfare'),
(20, 'Completed', 100.00, '2018-04-05', 'Corridor open for traffic', 'NHAI'),
(21, 'In Progress', 88.00, '2019-11-20', 'Final terminal automated', 'Port Authority'),
(22, 'Completed', 100.00, '2017-08-15', 'Ready for games', 'Sports Authority'),
(23, 'In Progress', 60.00, '2023-12-20', '40km sea wall built', 'Coastal Board'),
(24, 'Completed', 100.00, '2019-01-15', 'Implemented state-wide', 'Education Dept'),
(25, 'Not Started', 0.00, '2023-08-10', 'Environmental clearance pending', 'Ind Ministry'),
(26, 'In Progress', 45.00, '2024-02-10', 'Clinics ready in 15 districts', 'Health Dept'),
(27, 'Completed', 100.00, '2021-06-15', 'Lab fully functional', 'Cyber Cell'),
(28, 'Completed', 100.00, '2022-03-20', 'Fund fully utilized', 'Agri Dept'),
(29, 'Completed', 100.00, '2018-11-10', 'Parks open to public', 'Forest Dept'),
(30, 'Completed', 100.00, '2020-04-15', 'Modernization complete', 'Home Ministry'),
(31, 'In Progress', 10.00, '2024-03-10', 'Portal live for applications', 'Energy Dept'),
(32, 'Abandoned', 35.00, '2022-05-15', 'Lack of public cooperation', 'Env Agency'),
(33, 'Completed', 100.00, '2017-05-20', 'Network established', 'Culture Dept'),
(34, 'Delayed', 82.00, '2019-10-15', 'Steel supply issues', 'PWD'),
(35, 'Completed', 100.00, '2016-11-30', '10,000 youth trained', 'Labour Dept'),
(36, 'In Progress', 15.00, '2024-01-25', 'First 3 hubs ready', 'Agri Dept');

-- 6. INDICATOR
INSERT INTO INDICATOR (Indicator_Name, Unit, Description, Frequency, PolicyArea_ID, baseline_value, target_value) VALUES
('Infant Mortality Rate', 'per 1000', 'Deaths of infants under one year old', 'Annual', 1, 38.0, 25.0),
('Doctor-Patient Ratio', 'ratio', 'Number of doctors per 1000 people', 'Annual', 1, 0.6, 1.2),
('Female Literacy Rate', '%', 'Literacy among women', 'Annual', 2, 58.0, 75.0),
('Net Enrollment Ratio', '%', 'Primary school enrollment', 'Annual', 2, 82.0, 98.0),
('Rural Electrification', '%', 'Villages with power grid', 'Monthly', 10, 65.0, 100.0),
('Forest Cover', '%', 'Land area under forest', 'Annual', 6, 21.0, 33.0),
('Unemployment Rate', '%', 'Percentage of active labor force', 'Monthly', 5, 8.5, 4.0),
('Avg Crop Yield', 'tons/ha', 'Yield per hectare for major crops', 'Annual', 4, 2.4, 4.5),
('Internet Penetration', '%', 'Population with internet access', 'Monthly', 8, 32.0, 75.0),
('Crime Detection Rate', '%', 'Percentage of cases solved', 'Annual', 11, 45.0, 70.0);

-- 7. OUTCOME_DATA
INSERT INTO OUTCOME_DATA (Year, Measured_Value, Source, Measured_Group, Indicator_ID, Govt_ID, verification_status, Reliability_Score) VALUES
(2015, 36.5, 'Health Survey', 'Rural', 1, 4, 'Verified', 0.95),
(2017, 34.2, 'Health Survey', 'Rural', 1, 4, 'Verified', 0.95),
(2019, 31.8, 'Health Survey', 'Rural', 1, 1, 'Verified', 0.98),
(2021, 28.5, 'Health Survey', 'Rural', 1, 1, 'Verified', 0.98),
(2023, 26.2, 'Health Survey', 'Rural', 1, 1, 'Verified', 0.99),
(2018, 0.65, 'MCI Data', 'State', 2, 1, 'Verified', 0.92),
(2020, 0.82, 'MCI Data', 'State', 2, 1, 'Verified', 0.94),
(2022, 1.05, 'MCI Data', 'State', 2, 1, 'Verified', 0.95),
(2014, 59.2, 'Census Est', 'Female', 3, 4, 'Verified', 0.90),
(2016, 61.5, 'Census Est', 'Female', 3, 5, 'Verified', 0.90),
(2018, 64.8, 'Census Est', 'Female', 3, 1, 'Verified', 0.92),
(2020, 68.2, 'Census Est', 'Female', 3, 1, 'Verified', 0.92),
(2022, 72.5, 'Census Est', 'Female', 3, 1, 'Verified', 0.95),
(2015, 72.0, 'Power Grid', 'Rural', 5, 5, 'Verified', 0.99),
(2018, 85.5, 'Power Grid', 'Rural', 5, 1, 'Verified', 0.99),
(2021, 98.2, 'Power Grid', 'Rural', 5, 3, 'Verified', 1.00),
(2014, 21.2, 'Satellite Imagery', 'Total', 6, 4, 'Verified', 0.99),
(2018, 22.5, 'Satellite Imagery', 'Total', 6, 1, 'Verified', 0.99),
(2023, 24.8, 'Satellite Imagery', 'Total', 6, 2, 'Verified', 1.00),
(2020, 8.2, 'Labour Bureau', 'Youth', 7, 3, 'Verified', 0.88),
(2022, 7.5, 'Labour Bureau', 'Youth', 7, 3, 'Verified', 0.90),
(2024, 6.8, 'Labour Bureau', 'Youth', 7, 2, 'Pending', 0.85),
(2018, 2.5, 'Agri Dept', 'State', 8, 1, 'Verified', 0.96),
(2020, 3.1, 'Agri Dept', 'State', 8, 3, 'Verified', 0.96),
(2023, 3.9, 'Agri Dept', 'State', 8, 2, 'Verified', 0.97),
(2018, 35.0, 'TRAI Report', 'State', 9, 1, 'Verified', 0.98),
(2021, 58.0, 'TRAI Report', 'State', 9, 3, 'Verified', 0.98),
(2023, 72.0, 'TRAI Report', 'State', 9, 2, 'Verified', 0.99),
(2015, 46.0, 'Home Ministry', 'State', 10, 5, 'Verified', 0.92),
(2018, 52.0, 'Home Ministry', 'State', 10, 1, 'Verified', 0.94),
(2022, 65.0, 'Home Ministry', 'State', 10, 3, 'Verified', 0.95);

-- 8. PROMISE_INDICATOR
INSERT INTO PROMISE_INDICATOR (Promise_ID, Indicator_ID, Target_Impact) VALUES
(1, 1, 'Reduce IMR via primary care'),
(1, 2, 'Increase doctor availability'),
(2, 4, 'Improve school enrollment'),
(3, 8, 'Increase yield via support'),
(10, 9, 'Broadband access to villages'),
(12, 5, 'Clean energy contribution'),
(16, 3, 'Native language literacy'),
(24, 4, 'Nutritional impact on enrollment'),
(30, 10, 'Scientific detection tools'),
(31, 5, 'Renewable energy adoption');
