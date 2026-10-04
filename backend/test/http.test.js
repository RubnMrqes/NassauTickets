import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/db.js';
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = 'http://127.0.0.1:' + server.address().port + '/api';
after(async () => { await new Promise(resolve => server.close(resolve)); await pool.end(); });
test('rota protegida exige login e retorna JSON', async () => {
  const response = await fetch(base + '/relatorios?periodo=2026-10');
  assert.equal(response.status, 401);
  assert.match((await response.json()).erro, /login/);
});
test('entrada inválida é rejeitada antes de acessar o banco', async () => {
  const response = await fetch(base + '/senhas', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"tipo":"XX"}'
  });
  assert.equal(response.status, 400);
});
test('JSON malformado e tamanho excessivo não derrubam a API', async () => {
  const bad = await fetch(base + '/senhas', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{'
  });
  assert.equal(bad.status, 400);
  const big = await fetch(base + '/senhas', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: 'x'.repeat(20000) })
  });
  assert.equal(big.status, 413);
});
