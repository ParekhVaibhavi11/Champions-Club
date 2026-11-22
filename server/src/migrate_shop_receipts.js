import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './config/db.js';

const migrationPath = fileURLToPath(new URL('../../database/migrations/004_shop_order_receipts.sql', import.meta.url));

try {
  const migration = await readFile(path.resolve(migrationPath), 'utf8');
  await pool.query(migration);
  console.log('Gear Shop receipt migration completed.');
} catch (error) {
  console.error('Gear Shop receipt migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
