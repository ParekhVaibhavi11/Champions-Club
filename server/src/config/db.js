import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'champions_club',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Execute a query with connection pooling
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Transaction helper for atomic operations (e.g. POS orders, court bookings)
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Test initial database connection
 */
export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    console.log('✅ PostgreSQL Connected successfully at:', res.rows[0].current_time);
  } catch (err) {
    console.warn('⚠️  PostgreSQL connection warning (Ensure PostgreSQL is running & database created):', err.message);
  }
};
