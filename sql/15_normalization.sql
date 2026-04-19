-- ============================================================
-- Election Promises vs Actual Implementation
-- 15_normalization.sql — Normalization Analysis & Demonstration
-- ============================================================

USE election_promises_db;

-- ============================================================
-- CURRENT SCHEMA ANALYSIS
-- ============================================================

-- ┌─────────────────────────────────────────────────────────┐
-- │           1NF (First Normal Form) - SATISFIED           │
-- ├─────────────────────────────────────────────────────────┤
-- │ ✓ All tables have atomic (indivisible) values           │
-- │ ✓ Each column contains a single value                   │
-- │ ✓ No repeating groups exist                             │
-- │ ✓ Every table has a defined primary key                 │
-- │ ✓ Each row is uniquely identifiable                     │
-- └─────────────────────────────────────────────────────────┘

-- ┌─────────────────────────────────────────────────────────┐
-- │          2NF (Second Normal Form) - SATISFIED           │
-- ├─────────────────────────────────────────────────────────┤
-- │ ✓ Already in 1NF                                       │
-- │ ✓ All non-key attributes are fully functionally         │
-- │   dependent on the entire primary key                   │
-- │ ✓ No partial dependencies (single-column PKs or         │
-- │   properly composed composite PKs)                      │
-- │                                                         │
-- │ Example: PROMISE_INDICATOR(Promise_ID, Indicator_ID)    │
-- │   → Target_Impact depends on BOTH Promise_ID AND        │
-- │     Indicator_ID, not just one of them                  │
-- └─────────────────────────────────────────────────────────┘

-- ┌─────────────────────────────────────────────────────────┐
-- │          3NF (Third Normal Form) - SATISFIED            │
-- ├─────────────────────────────────────────────────────────┤
-- │ ✓ Already in 2NF                                       │
-- │ ✓ No transitive dependencies                           │
-- │                                                         │
-- │ PROMISE table functional dependencies:                  │
-- │   Promise_ID → {Title, Description, Govt_ID,            │
-- │                  PolicyArea_ID, Budget, Priority}        │
-- │   Govt_ID → {Party_Name, CM} (in GOVERNMENT table,      │
-- │              NOT stored redundantly in PROMISE)          │
-- │                                                         │
-- │ No non-key attribute depends on another non-key          │
-- │ attribute within the same table.                         │
-- └─────────────────────────────────────────────────────────┘


-- ============================================================
-- DEMONSTRATION: DENORMALIZED TABLE (Violates 2NF & 3NF)
-- ============================================================

-- This table has redundancy and transitive dependencies:
CREATE TABLE PROMISE_DENORMALIZED (
    Promise_ID INT PRIMARY KEY,
    Title VARCHAR(200),
    Description TEXT,
    Announcement_Year INT,
    -- Transitive dependency: Promise_ID → Govt_ID → Party_Name
    Party_Name VARCHAR(100),      -- ← REDUNDANT (stored in GOVERNMENT)
    Chief_Minister VARCHAR(100),  -- ← REDUNDANT (stored in GOVERNMENT)
    -- Transitive dependency: Promise_ID → PolicyArea_ID → Area_Name
    Area_Name VARCHAR(100),       -- ← REDUNDANT (stored in POLICY_AREA)
    Status_Type VARCHAR(20),      -- ← belongs in IMPLEMENTATION_STATUS
    Progress_Percentage DECIMAL(5,2) -- ← belongs in IMPLEMENTATION_STATUS
);

-- Insert denormalized sample data
INSERT INTO PROMISE_DENORMALIZED VALUES
(1, 'Universal Healthcare Coverage', 'Free healthcare...', 2018,
 'Progressive Party', 'Rajesh Kumar', 'Healthcare', 'In Progress', 65.00),
(2, 'Digital Education Initiative', 'Tablets for students...', 2018,
 'Progressive Party', 'Rajesh Kumar', 'Education', 'Completed', 100.00),
(3, 'Metro Rail Expansion', 'Extend metro...', 2023,
 'People''s Alliance', 'Priya Sharma', 'Infrastructure', 'In Progress', 25.00);


-- ============================================================
-- PROBLEMS WITH DENORMALIZATION
-- ============================================================

-- PROBLEM 1: Update Anomaly
-- If the Progressive Party changes its chief minister,
-- we must update EVERY row with that party name.
-- Missing one row creates an inconsistency.
-- UPDATE PROMISE_DENORMALIZED 
-- SET Chief_Minister = 'New CM' 
-- WHERE Party_Name = 'Progressive Party';
-- (Must update ALL rows, risk of partial update)

-- PROBLEM 2: Insertion Anomaly
-- Cannot add a new policy area without a promise
-- (Would need to insert NULL for Promise_ID)

-- PROBLEM 3: Deletion Anomaly
-- Deleting Promise 3 would also lose the fact that
-- "People's Alliance" exists with "Priya Sharma" as CM


-- ============================================================
-- NORMALIZATION STEPS: 1NF → 2NF → 3NF
-- ============================================================

-- ──────────────────────────────────
-- Step 1: Ensure 1NF (already met)
-- ──────────────────────────────────
-- Atomic values ✓, Primary key ✓, No repeating groups ✓

-- ──────────────────────────────────
-- Step 2: Convert to 2NF
-- ──────────────────────────────────
-- Remove partial dependencies (not applicable with single-column PK)
-- All non-key attributes fully depend on Promise_ID → Already in 2NF

-- ──────────────────────────────────
-- Step 3: Convert to 3NF — Remove transitive dependencies
-- ──────────────────────────────────

-- TRANSITIVE DEPENDENCY 1:
-- Promise_ID → Govt_ID → {Party_Name, Chief_Minister}
-- SOLUTION: Move Party_Name, Chief_Minister to GOVERNMENT table
--           Keep only Govt_ID (FK) in PROMISE

-- TRANSITIVE DEPENDENCY 2:
-- Promise_ID → PolicyArea_ID → Area_Name
-- SOLUTION: Move Area_Name to POLICY_AREA table
--           Keep only PolicyArea_ID (FK) in PROMISE

-- TRANSITIVE DEPENDENCY 3:
-- Promise_ID → Status_ID → {Status_Type, Progress_Percentage}
-- SOLUTION: Move status data to IMPLEMENTATION_STATUS table


-- ============================================================
-- RESULT: Normalized Schema (our actual design)
-- ============================================================

-- GOVERNMENT(Govt_ID PK, Party_Name, Chief_Minister, ...)
-- POLICY_AREA(PolicyArea_ID PK, Area_Name, ...)
-- PROMISE(Promise_ID PK, Title, Govt_ID FK, PolicyArea_ID FK, ...)
-- IMPLEMENTATION_STATUS(Status_ID PK, Promise_ID FK, Status_Type, ...)

-- Each table stores ONLY attributes directly dependent on its PK.
-- Foreign keys replace redundant data copies.
-- No transitive dependencies remain.


-- ============================================================
-- VERIFICATION: Compare storage & redundancy
-- ============================================================

-- Denormalized: "Progressive Party" and "Rajesh Kumar" stored 2+ times
SELECT Party_Name, Chief_Minister, COUNT(*) AS Redundant_Copies
FROM PROMISE_DENORMALIZED
GROUP BY Party_Name, Chief_Minister;

-- Normalized: stored exactly once
SELECT Party_Name, Chief_Minister
FROM GOVERNMENT;

-- Cleanup demonstration table
DROP TABLE IF EXISTS PROMISE_DENORMALIZED;
