const mysql = require('mysql2/promise');
require('dotenv').config();

const poolOptions = { waitForConnections: true, connectionLimit: 10, queueLimit: 0 };

// DATABASE_URL (mysql://user:pass@host:port/db) wins when set — one variable for hosting.
// Otherwise DB_* locally, or the MYSQL* variables Railway's MySQL service provides.
const pool = process.env.DATABASE_URL
  ? mysql.createPool({ uri: process.env.DATABASE_URL.trim(), ...poolOptions })
  : mysql.createPool({
      host:     process.env.DB_HOST     || process.env.MYSQLHOST     || 'localhost',
      port:     process.env.DB_PORT     || process.env.MYSQLPORT     || 3306,
      user:     process.env.DB_USER     || process.env.MYSQLUSER     || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
      database: process.env.DB_NAME     || process.env.MYSQLDATABASE || 'red_database',
      ...poolOptions,
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
