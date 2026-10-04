import mysql from 'mysql2/promise';
import { config } from './config.js';
export const pool = mysql.createPool(config.db);

// Uma conexão exclusiva garante consultas dentro da mesma transação.
export async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export function serialize(row) {
  if (!row) return null;
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key, key.endsWith('_em') && typeof value === 'string'
      ? value.replace(' ', 'T') + 'Z' : value
  ]));
}
