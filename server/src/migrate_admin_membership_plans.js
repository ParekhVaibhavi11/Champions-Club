import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './config/db.js';

const migrationPath = fileURLToPath(new URL('../../database/migrations/007_admin_membership_plans.sql', import.meta.url));

try {
  const migration = await readFile(path.resolve(migrationPath), 'utf8');
  await pool.query(migration);
  console.log('Admin membership plan migration completed.');
} catch (error) {
  console.error('Admin membership plan migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
