import { readFile } from 'node:fs/promises';
import { pool } from '../src/db.js';
// O banco vazio já deve existir (Docker Compose ou MySQL Workbench).
try {
  const sql = await readFile(new URL('../../docs/mer/schema.sql', import.meta.url), 'utf8');
  for (const statement of sql.split(';').map(text => text.trim()).filter(Boolean)) {
    await pool.query(statement);
  }
  console.log('Tabelas criadas. Rode npm run db:seed.');
} finally { await pool.end(); }
