import { Router } from 'express';
import { pool } from './db.js';
import { authenticated, manager } from './middleware/auth.js';
import { assert } from './domain/errors.js';
import { login, createUser } from './services/auth-service.js';
import * as tickets from './services/ticket-service.js';
import { report } from './services/report-service.js';
export const router = Router();
router.get('/health', async (req, res) => {
  await pool.execute('SELECT 1');
  res.json({ status: 'ok' });
});
router.post('/auth/login', async (req, res) => res.json(await login(req.body)));
router.post('/senhas', async (req, res) => res.status(201).json(await tickets.issue(req.body?.tipo)));
router.get('/painel', async (req, res) => res.json(await tickets.panel()));
// As rotas abaixo exigem uma sessão válida.
router.use(authenticated);
router.post('/auth/logout', async (req, res) => {
  await pool.execute('DELETE FROM sessoes WHERE token_hash=?', [req.tokenHash]);
  res.status(204).end();
});
router.get('/guiches', async (req, res) => {
  const [rows] = await pool.execute('SELECT id,numero FROM guiches WHERE ativo=1 ORDER BY numero');
  res.json(rows);
});
router.get('/atendimento/atual', async (req, res) => res.json(await tickets.currentTicket(req.user.id)));
router.post('/atendimento/proximo', async (req, res) =>
  res.json(await tickets.callNext(req.user.id, req.body?.guicheId)));
router.post('/senhas/:id/:acao', async (req, res) =>
  res.json(await tickets.changeState(req.user.id, req.params.id, req.params.acao)));
router.get('/relatorios', manager, async (req, res) => res.json(await report(req.query.periodo)));
router.get('/usuarios', manager, async (req, res) => {
  const [rows] = await pool.execute('SELECT id,nome,email,gestor,ativo FROM usuarios ORDER BY id');
  res.json(rows);
});
router.post('/usuarios', manager, async (req, res) => res.status(201).json(await createUser(req.body)));
router.post('/guiches', manager, async (req, res) => {
  const numero = Number(req.body?.numero);
  assert(Number.isInteger(numero) && numero >= 1 && numero <= 999, 400, 'Guichê deve ser de 1 a 999.');
  const [result] = await pool.execute('INSERT INTO guiches (numero) VALUES (?)', [numero]);
  res.status(201).json({ id: result.insertId, numero });
});
