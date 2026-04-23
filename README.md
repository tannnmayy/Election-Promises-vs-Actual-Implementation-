# Election Promises vs Actual Implementation

A comprehensive DBMS project that tracks and analyzes government election promises against their actual implementation status, with measurable outcomes using policy indicators.

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `POLICY_AREA` | Categories of government policies |
| `ELECTION` | Electoral events |
| `GOVERNMENT` | Governing bodies formed after elections |
| `PROMISE` | Election promises made by governments |
| `IMPLEMENTATION_STATUS` | Track promise fulfillment progress |
| `INDICATOR` | Measurable metrics for policy areas |
| `OUTCOME_DATA` | Actual measured outcomes |
| `PROMISE_INDICATOR` | Many-to-many link (Promise ↔ Indicator) |
| `PROMISE_AUDIT_LOG` | Audit trail for status changes |

## 🚀 Setup

### Database (MySQL)

Run the SQL scripts **in order** on your MySQL server:

```bash
mysql -u root -p < sql/01_schema.sql
mysql -u root -p election_promises_db < sql/02_sample_data.sql
# Then run 03–15 as needed
```

### Frontend

Open `frontend/index.html` directly in any browser — no server needed. The dashboard uses hardcoded sample data matching the SQL inserts.

## ✨ Features Covered

- **Aggregate Functions** — COUNT, AVG, SUM, MIN, MAX with GROUP BY / HAVING
- **Subqueries** — Scalar, derived table, correlated, EXISTS, NOT IN
- **Joins** — INNER, LEFT, RIGHT, CROSS, SELF, NATURAL
- **Set Operations** — UNION, UNION ALL, simulated INTERSECT & EXCEPT
- **Views** — 4 comprehensive views
- **Stored Functions** — Fulfillment rate, status category, budget efficiency
- **Stored Procedures** — Status update with validation, government report
- **Triggers** — Auto-timestamp, validation, audit logging, deletion prevention
- **Cursors** — Bulk overdue marking, performance report generation
- **Normalization** — 1NF → 2NF → 3NF with denormalized counterexample
- **Concurrency** — Transactions, savepoints, isolation levels, deadlock
- **Indexing** — Composite, full-text, EXPLAIN analysis
- **Frontend** — Premium dark-theme dashboard with charts and filters


