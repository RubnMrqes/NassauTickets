import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { pool, transaction } from '../src/db.js';
import { config } from '../src/config.js';
import { businessClock } from '../src/domain/clock.js';
import { issue, callNext, changeState, expireQueue, panel } from '../src/services/ticket-service.js';
import { report } from '../src/services/report-service.js';
import { hashPassword } from '../src/services/password.js';
import { login } from '../src/services/auth-service.js';

// Este teste altera SOMENTE um banco separado e inicialmente vazio.
assert(config.db.database.endsWith('_test'), 'Defina DB_NAME com sufixo _test. Nunca use o banco da aplicação.');
after(() => pool.end());
test('MySQL: concorrência, estados, auditoria, login, limites e encerramento', async () => {
  const [initial] = await pool.query(
    'SELECT (SELECT COUNT(*) FROM senhas)+(SELECT COUNT(*) FROM usuarios)+(SELECT COUNT(*) FROM guiches) AS total');
  assert.equal(Number(initial[0].total), 0, 'O banco de teste deve estar vazio; não rode db:seed nele.');
  const date = businessClock().date;
  const noon = new Date(date + 'T15:00:00Z');
  const closed = new Date(date + 'T20:00:00Z');
  let fixtureCreated = false;
  try {
    const password = 'senha-local-de-teste-2026';
    const users = [];
    const counters = [];
    for (let n = 1; n <= 3; n++) {
      const [user] = await pool.execute('INSERT INTO usuarios (nome,email,senha_hash,gestor) VALUES (?,?,?,?)',
        ['Teste ' + n, 'teste' + n + '@example.test', await hashPassword(password), n === 1 ? 1 : 0]);
      fixtureCreated = true;
      users.push(user.insertId);
      const [counter] = await pool.execute('INSERT INTO guiches (numero) VALUES (?)', [n]);
      counters.push(counter.insertId);
    }
    await assert.rejects(login({ email: 'teste1@example.test', senha: 'senha-incorreta-longa' }),
      error => error.status === 401);
    const session = await login({ email: 'teste1@example.test', senha: password });
    assert.equal(session.token.length, 64);
    const [stored] = await pool.execute('SELECT token_hash FROM sessoes WHERE usuario_id=?', [users[0]]);
    assert.notEqual(stored[0].token_hash, session.token);
    await assert.rejects(pool.execute(
      'INSERT INTO usuarios (nome,email,senha_hash,gestor) VALUES (?,?,?,1)',
      ['Outro gestor','outro@example.test', await hashPassword(password)]),
      error => error.code === 'ER_DUP_ENTRY');

    const emitted = await Promise.all(Array.from({ length: 20 }, () => issue('SP', noon)));
    assert.equal(new Set(emitted.map(row => row.numero)).size, 20);
    assert.deepEqual(emitted.map(row => row.sequencia).sort((a,b) => a-b), Array.from({ length: 20 }, (_,i) => i+1));
    await issue('SE', noon); await issue('SG', noon);
    const assigned = await Promise.all([
      callNext(users[0], counters[0], noon), callNext(users[1], counters[1], noon)
    ]);
    assert.notEqual(assigned[0].id, assigned[1].id);
    assert.deepEqual(assigned.map(row => row.tipo).sort(), ['SE','SP']);
    await assert.rejects(callNext(users[0], counters[2], noon), error => error.status === 409);
    await assert.rejects(changeState(users[1], assigned[0].id, 'iniciar', noon), error => error.status === 403);
    await assert.rejects(changeState(users[0], assigned[0].id, 'ausente', noon), error => error.status === 409);
    await changeState(users[0], assigned[0].id, 'iniciar', noon);
    await changeState(users[0], assigned[0].id, 'finalizar', noon);
    await assert.rejects(changeState(users[0], assigned[0].id, 'finalizar', noon), error => error.status === 409);
    await changeState(users[1], assigned[1].id, 'rechamar', noon);
    await changeState(users[1], assigned[1].id, 'ausente', noon);

    const next = await callNext(users[2], counters[2], noon);
    assert.equal(next.tipo, 'SP');
    const following = await callNext(users[0], counters[0], noon);
    assert.equal(following.tipo, 'SG');
    await changeState(users[2], next.id, 'iniciar', noon);
    await assert.rejects(issue('SG', closed), error => error.status === 409);
    await assert.rejects(callNext(users[1], counters[1], closed), error => error.status === 409);
    await assert.rejects(changeState(users[0], following.id, 'iniciar', closed), error => error.status === 409);
    await expireQueue(closed);
    assert.equal((await changeState(users[2], next.id, 'finalizar', closed)).estado, 'ATENDIDA');
    const [discarded] = await pool.execute('SELECT estado FROM senhas WHERE id=?', [following.id]);
    assert.equal(discarded[0].estado, 'DESCARTADA');
    const calls = await panel();
    assert.equal(calls.length, 5);
    assert(calls.some(row => row.estado === 'CHAMADA_NOVAMENTE'));
    const result = await report(date);
    assert.equal(result.resumo.emitidas, 22);
    assert.equal(result.resumo.atendidas, 2);
    assert.equal(result.resumo.nao_compareceram, 1);
    assert(result.detalhado.filter(row => row.estado !== 'ATENDIDA')
      .every(row => row.atendimento_em === null && row.guiche === null));
    assert(result.auditoria.some(row => row.segunda_chamada_em));
    const [history] = await pool.execute('SELECT estado FROM eventos WHERE senha_id=? ORDER BY id', [assigned[0].id]);
    assert.deepEqual(history.map(row => row.estado),
      ['EMITIDA','AGUARDANDO','CHAMADA','EM_ATENDIMENTO','ATENDIDA']);

    await pool.execute("UPDATE sequencias SET valor=999 WHERE data_operacao=? AND tipo='SP'", [date]);
    await assert.rejects(issue('SP', noon), error => error.status === 409);
    const [count] = await pool.execute('SELECT COUNT(*) AS total FROM senhas');
    assert.equal(Number(count[0].total), 22);
  } finally {
    if (fixtureCreated) await transaction(async connection => {
      for (const table of ['eventos','sessoes','senhas','sequencias','alternancia','guiches','usuarios']) {
        await connection.query('DELETE FROM ' + table);
      }
    });
  }
});
