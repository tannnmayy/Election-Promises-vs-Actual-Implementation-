const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    multipleStatements: true
  });

  console.log('Connected to MySQL server.');

  try {
    const sqlPath = path.join(__dirname, '..', '..', 'schema.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove DELIMITER commands as they are for CLI
    sql = sql.replace(/DELIMITER \/\/|DELIMITER ;/g, '');
    
    // Replace // with ; for the split to work correctly if needed, 
    // but multipleStatements: true handles most things if we just send the whole block.
    // However, mysql2 + multipleStatements has issues with some procedural code.
    
    // Let's try executing the whole thing first.
    console.log('Executing schema.sql...');
    await connection.query(sql);
    console.log('Database initialized successfully.');

  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    await connection.end();
  }
}

setup();
