const mysql = require('mysql2/promise');

let pool;

function getDatabaseConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskteam',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
  };
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool(getDatabaseConfig());
  }

  return pool;
}

async function connectDatabase() {
  const dbPool = getPool();
  await dbPool.query('SELECT 1');
  return dbPool;
}

async function query(sql, params = []) {
  const dbPool = getPool();
  const [rows] = await dbPool.execute(sql, params);
  return rows;
}

/**
 * Run multiple queries inside a single transaction.
 * Usage: await transaction(async (conn) => { await conn.execute(...); });
 * Automatically commits on success, rolls back on error.
 */
async function transaction(callback) {
  const dbPool = getPool();
  const conn = await dbPool.getConnection();

  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  connectDatabase,
  getPool,
  query,
  transaction,
};
