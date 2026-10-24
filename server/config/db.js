const mysql = require('mysql2/promise');
require('dotenv').config();

// DB_* locally; Railway's MySQL service provides MYSQL* variables
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || process.env.MYSQLHOST     || 'localhost',
  port:               process.env.DB_PORT     || process.env.MYSQLPORT     || 3306,
  user:               process.env.DB_USER     || process.env.MYSQLUSER     || 'root',
  password:           process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database:           process.env.DB_NAME     || process.env.MYSQLDATABASE || 'red_database',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Where we're connecting (no password) — shown in logs and /api/health
pool.target = `${pool.pool.config.connectionConfig.host}:${pool.pool.config.connectionConfig.port}/${pool.pool.config.connectionConfig.database}`;

// Connection errors can have an empty message (e.g. AggregateError on ECONNREFUSED); fall back to the code
pool.describeError = (err) => err.message || err.code || String(err);

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected:', pool.target);
    conn.release();
  } catch (err) {
    console.error(`❌ MySQL connection failed (${pool.target}):`, pool.describeError(err));
  }
})();

module.exports = pool;
