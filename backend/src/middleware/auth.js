import { pool } from '../db.js';
import { assert } from '../domain/errors.js';
import { tokenHash } from '../services/password.js';

export async function authenticated(req, _res, next) {
  const authorization = req.headers.authorization || '';
  const match = /^Bearer ([a-f0-9]{64})$/.exec(authorization);

  assert(match, 401, 'Faça login para continuar.');

  const hash = tokenHash(match[1]);

  const [rows] = await pool.execute(
    `SELECT
      u.id,
      u.nome,
      u.email,
      u.gestor
    FROM sessoes s
    JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.token_hash = ?
      AND s.expira_em > UTC_TIMESTAMP(3)
      AND u.ativo = 1`,
    [hash]
  );

  assert(rows.length > 0, 401, 'Sessão inválida ou expirada.');

  req.user = rows[0];
  req.tokenHash = hash;

  next();
}

export function manager(req, _res, next) {
  assert(req.user.gestor === 1, 403, 'Acesso exclusivo do gestor.');

  next();
}