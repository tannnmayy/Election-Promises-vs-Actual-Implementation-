// ============================================================
// Express Server — Election Promises DBMS Dashboard
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Serve Frontend Static Files ─────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const status = await testConnection();
  if (status.connected) {
    res.json({
      status: 'connected',
      database: process.env.DB_NAME || 'election_promises_db',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'disconnected',
      error: status.error,
      timestamp: new Date().toISOString()
    });
  }
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/aggregate', require('./routes/aggregate'));
app.use('/api/subqueries', require('./routes/subqueries'));
app.use('/api/joins', require('./routes/joins'));
app.use('/api/sets', require('./routes/set_operations'));
app.use('/api/views', require('./routes/views'));
app.use('/api/functions', require('./routes/functions'));
app.use('/api/procedures', require('./routes/procedures'));
app.use('/api/triggers', require('./routes/triggers'));
app.use('/api/cursors', require('./routes/cursors'));
app.use('/api/normalization', require('./routes/normalization'));
app.use('/api/concurrency', require('./routes/concurrency'));

// ─── Catch-all: serve index.html for client-side routing ─────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ─── Error Handling Middleware ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health\n`);

  const status = await testConnection();
  if (status.connected) {
    console.log(`✅ Database connected: ${process.env.DB_NAME || 'election_promises_db'}\n`);
  } else {
    console.log(`❌ Database connection failed: ${status.error}`);
    console.log(`   Make sure MySQL is running and .env is configured.\n`);
  }
});
