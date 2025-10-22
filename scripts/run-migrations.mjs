// Simple SQL migration runner for Neon/Supabase using @neondatabase/serverless
// Applies files in database/migrations in lexical order and records history.

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Load env (prefers .env.local if present)
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Please set it in .env.local');
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

async function ensureHistoryTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migration_history (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function hasApplied(filename) {
  const res = await pool.query('SELECT 1 FROM migration_history WHERE filename = $1', [filename]);
  return res.rowCount > 0;
}

async function markApplied(filename) {
  await pool.query('INSERT INTO migration_history (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
}

async function applyFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  // Execute as a single script; files are written to be idempotent (IF NOT EXISTS / OR REPLACE)
  await pool.query(sql);
}

async function main() {
  const dir = path.resolve('database/migrations');
  const entries = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${entries.length} migration files.`);

  await ensureHistoryTable();

  for (const filename of entries) {
    const already = await hasApplied(filename);
    if (already) {
      console.log(`- Skipping ${filename} (already applied)`);
      continue;
    }
    const p = path.join(dir, filename);
    process.stdout.write(`- Applying ${filename} ... `);
    try {
      await applyFile(p);
      await markApplied(filename);
      console.log('OK');
    } catch (err) {
      console.error(`FAILED\n\nError applying ${filename}:`, err);
      process.exit(1);
    }
  }

  await pool.end();
  console.log('Migrations complete.');
}

main().catch(async (err) => {
  console.error(err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
