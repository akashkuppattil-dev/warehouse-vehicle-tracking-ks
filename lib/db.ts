import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('DATABASE_URL environment variable is not set. API routes will fail at runtime.');
}

const pool = new Pool({
  connectionString: connectionString || 'postgresql://dummy:dummy@localhost:5432/dummy',
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[v0] Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('[v0] Database error:', error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}

export default pool;
