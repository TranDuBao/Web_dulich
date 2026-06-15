const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'web_dulich',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database: ' + (process.env.DB_NAME || 'web_dulich'));
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err.message);
  });

module.exports = pool;
