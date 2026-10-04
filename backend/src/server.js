import { app } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';
import { expireQueue } from './services/ticket-service.js';
let running = false;
async function sweep() {
  if (running) return;
  running = true;
  try { await expireQueue(); }
  catch (error) { console.error('Falha ao encerrar fila:', error.code || error.name); }
  finally { running = false; }
}
await sweep();
const server = app.listen(config.port, () =>
  console.log('nassauTickets API: http://localhost:' + config.port + '/api'));
const timer = setInterval(sweep, 30_000);
async function shutdown() {
  clearInterval(timer);
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
