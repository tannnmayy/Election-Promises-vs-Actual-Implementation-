# Election Promises vs Actual Implementation — DBMS Educational Dashboard

A full-stack interactive web application that demonstrates 11 DBMS concepts through real MySQL queries, visualizations, and educational explanations.

## 🏗️ Architecture

```
├── backend/            # Node.js + Express API server
│   ├── server.js       # Main server (serves frontend + API)
│   ├── config/
│   │   └── database.js # MySQL connection pool
│   └── routes/         # 11 route modules (one per chapter)
├── frontend/           # Vanilla HTML/CSS/JS dashboard
│   ├── index.html      # Main page with 11 chapter tabs
│   ├── css/styles.css  # Academic white theme
│   └── js/             # Core + 11 chapter modules
├── sql/                # 15 SQL scripts (schema, data, queries)
└── README.md
```

## 📋 Prerequisites

- **Node.js** v14+ and npm
- **MySQL Server** 8.0+
- Modern web browser (Chrome, Firefox, Edge)

## 🚀 Installation

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run scripts in order:
SOURCE sql/01_schema.sql;
SOURCE sql/02_sample_data.sql;
SOURCE sql/07_views.sql;
SOURCE sql/08_functions.sql;
SOURCE sql/09_procedures.sql;
SOURCE sql/10_triggers.sql;
SOURCE sql/11_cursors.sql;
SOURCE sql/13_concurrency.sql;
SOURCE sql/15_normalization.sql;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure database credentials
# Edit .env file with your MySQL username and password:
#   DB_HOST=localhost
#   DB_USER=root
#   DB_PASSWORD=your_password
#   DB_NAME=election_promises_db
#   DB_PORT=3306
#   PORT=3000

# Start server
npm start
```

### 3. Open Dashboard

Visit **http://localhost:3000** in your browser.

### 4. Verify Connection

Visit **http://localhost:3000/api/health** — should return:
```json
{ "status": "connected", "database": "election_promises_db" }
```

## 📚 11 DBMS Chapters

| # | Chapter | Concepts | Queries |
|---|---------|----------|---------|
| 1 | **Aggregate Functions** | COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING | 5 |
| 2 | **Subqueries** | Scalar, Derived Table, NOT IN, Correlated, EXISTS | 5 |
| 3 | **Joins** | INNER, LEFT, RIGHT, CROSS, SELF | 5 |
| 4 | **Set Operations** | UNION, UNION ALL, INTERSECT, EXCEPT | 6 |
| 5 | **Views** | CREATE VIEW, Virtual Tables, View Definitions | 4 |
| 6 | **Stored Functions** | CREATE FUNCTION, RETURNS, Parameterized Calls | 4 |
| 7 | **Stored Procedures** | CALL, IN/OUT Params, Multiple Result Sets | 2 |
| 8 | **Triggers** | BEFORE/AFTER, Audit Logging, Validation | 3 |
| 9 | **Cursors** | DECLARE CURSOR, FETCH, LOOP, Batch Processing | 2 |
| 10 | **Normalization** | 1NF → 2NF → 3NF, Anomalies, Dependencies | Interactive |
| 11 | **Concurrency** | Transactions, Savepoints, Isolation Levels, Locks | 4 |

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MySQL2, CORS, dotenv
- **Frontend**: Vanilla HTML/CSS/JS, Chart.js
- **Database**: MySQL 8.0+ with InnoDB

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection Error | Check MySQL is running and `.env` credentials are correct |
| CORS Error | Ensure backend server is running on port 3000 |
| Query Error | Ensure all SQL scripts (01-15) were executed in order |
| View/Function missing | Run `sql/07_views.sql`, `sql/08_functions.sql`, etc. |

## 📊 Database Schema

9 tables: POLICY_AREA, ELECTION, GOVERNMENT, PROMISE, IMPLEMENTATION_STATUS, INDICATOR, OUTCOME_DATA, PROMISE_INDICATOR, PROMISE_AUDIT_LOG

---

*Built for DBMS Course — Semester 4*
