import { randomBytes } from 'node:crypto';
import { pool } from '../db.js';
import { assert, credentials } from '../domain/errors.js';
import { hashPassword, verifyPassword, tokenHash } from './password.js';

// Evita pular o custo do hash quando o e-mail não existe.
const dummyHash = await hashPassword(randomBytes(32).toString('hex'));
export async function login(body) {
  const { email, password } = credentials(body);
  const [users] = await pool.execute('SELECT * FROM usuarios WHERE email=? AND ativo=1', [email]);
  const user = users[0];
  const valid = await verifyPassword(password, user?.senha_hash || dummyHash);
  assert(user && valid, 401, 'E-mail ou senha incorretos.');
  const token = randomBytes(32).toString('hex');
  await pool.execute('DELETE FROM sessoes WHERE expira_em <= UTC_TIMESTAMP(3)');
  await pool.execute(
    'INSERT INTO sessoes (token_hash,usuario_id,expira_em) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 8 HOUR))',
    [tokenHash(token), user.id]
  );
  return { token, usuario: { id: user.id, nome: user.nome, gestor: user.gestor === 1 } };
}
export async function createUser(body) {
  const { email, password } = credentials(body);
  const nome = String(body?.nome || '').trim();
  assert(nome.length >= 2 && nome.length <= 100, 400, 'Nome deve ter entre 2 e 100 caracteres.');
  // O único gestor é criado pelo seed. A API cria apenas atendentes.
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nome,email,senha_hash,gestor) VALUES (?,?,?,0)',
    [nome, email, await hashPassword(password)]
  );
  return { id: result.insertId, nome, email, gestor: false };
}
