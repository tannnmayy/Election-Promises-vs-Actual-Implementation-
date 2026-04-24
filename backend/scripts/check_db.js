const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root'
  });

  try {
    const [dbs] = await connection.query('SHOW DATABASES');
    console.log('Databases:', dbs.map(db => db.Database));

    const [tables_my_project] = await connection.query('SHOW TABLES FROM my_project_db').catch(() => [[]]);
    console.log('Tables in my_project_db:', tables_my_project);

    const [tables_election] = await connection.query('SHOW TABLES FROM election_promises_db').catch(() => [[]]);
    console.log('Tables in election_promises_db:', tables_election);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

check();
