import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { businessClock, ticketNumber } from '../src/domain/clock.js';
import { priorityOrder, transitions } from '../src/domain/queue.js';
import { positiveId, credentials } from '../src/domain/errors.js';
import { hashPassword, verifyPassword } from '../src/services/password.js';
import { reportRange } from '../src/services/report-service.js';
import { pool } from '../src/db.js';
after(() => pool.end());
test('07h inicia e 17h encerra no fuso do laboratório', () => {
  assert.equal(businessClock(new Date('2026-10-03T09:59:59Z')).open, false);
  assert.equal(businessClock(new Date('2026-10-03T10:00:00Z')).open, true);
  assert.equal(businessClock(new Date('2026-10-03T19:59:59Z')).open, true);
  assert.equal(businessClock(new Date('2026-10-03T20:00:00Z')).open, false);
  assert.equal(businessClock(new Date('2026-10-04T01:00:00Z')).date, '2026-10-03');
});
test('formato de senha tem data, tipo e três dígitos', () => {
  assert.equal(ticketNumber('2026-10-03','SP',1), '261003-SP001');
  assert.equal(ticketNumber('2026-10-03','SG',999), '261003-SG999');
});
test('alternância, filas vazias e prioridade de SE sobre SG', () => {
  const choose = (last, available) => priorityOrder(last).find(type => available.includes(type));
  assert.equal(choose(null, ['SG','SE','SP']), 'SP');
  assert.equal(choose('SP', ['SG','SE','SP']), 'SE');
  assert.equal(choose('SE', ['SG','SP']), 'SP');
  assert.equal(choose('SP', ['SP']), 'SP');
  assert.equal(choose('SP', ['SG']), 'SG');
  assert.equal(choose('SG', []), undefined);
});
test('estado permite início na primeira chamada e ausência apenas na segunda', () => {
  assert(transitions.iniciar.from.includes('CHAMADA'));
  assert(!transitions.ausente.from.includes('CHAMADA'));
  assert(transitions.ausente.from.includes('CHAMADA_NOVAMENTE'));
  assert.deepEqual(transitions.finalizar.from, ['EM_ATENDIMENTO']);
});
test('IDs e credenciais inválidos são rejeitados', () => {
  for (const value of [-1, 0, 'abc', '1.5', Infinity]) assert.throws(() => positiveId(value));
  assert.equal(positiveId('4'), 4);
  assert.throws(() => credentials({ email: 'abc', senha: 'abcdefghijkl' }));
  assert.throws(() => credentials({ email: 'a@b.com', senha: '123' }));
});
test('períodos consideram dias reais e anos bissextos', () => {
  assert.deepEqual(reportRange('2028-02'), { start: '2028-02-01', end: '2028-02-29' });
  for (const value of ['2026-02-29','2026-13','2026-10-00','2026-10-32','x']) assert.throws(() => reportRange(value));
});
test('scrypt aceita senha correta, rejeita incorreta e utiliza salt diferente', async () => {
  const hash = await hashPassword('uma-senha-de-estudo');
  assert(await verifyPassword('uma-senha-de-estudo', hash));
  assert.equal(await verifyPassword('outra-senha-qualquer', hash), false);
  assert.notEqual(hash, await hashPassword('uma-senha-de-estudo'));
});
