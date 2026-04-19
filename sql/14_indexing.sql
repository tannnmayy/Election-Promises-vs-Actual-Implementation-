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
