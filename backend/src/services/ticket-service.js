import { pool, transaction, serialize } from '../db.js';
import { businessClock, ticketNumber } from '../domain/clock.js';
import { TYPES, priorityOrder, transitions } from '../domain/queue.js';
import { assert, positiveId } from '../domain/errors.js';

async function queueTransaction(work, now) {
  return transaction(async connection => {
    // TODAS as mutações da fila passam pela mesma linha de bloqueio.
    await connection.execute('SELECT id FROM controle_fila WHERE id=1 FOR UPDATE');
    return work(connection, businessClock(now || new Date()));
  });
}
async function event(connection, ticket, state, userId = null) {
  await connection.execute('INSERT INTO eventos (senha_id,estado,usuario_id) VALUES (?,?,?)',
    [ticket, state, userId]);
}
async function load(connection, id) {
  const [rows] = await connection.execute('SELECT * FROM senhas WHERE id=?', [id]);
  return serialize(rows[0]);
}
export async function issue(type, now) {
  assert(TYPES.includes(type), 400, 'Tipo deve ser SP, SE ou SG.');
  return queueTransaction(async (connection, clock) => {
    assert(clock.open, 409, 'Emissão disponível das 07h às 17h de São Paulo.');
    await connection.execute(
      'INSERT INTO sequencias (data_operacao,tipo,valor) VALUES (?,?,0) ON DUPLICATE KEY UPDATE valor=valor',
      [clock.date, type]);
    const [rows] = await connection.execute(
      'SELECT valor FROM sequencias WHERE data_operacao=? AND tipo=? FOR UPDATE', [clock.date, type]);
    const sequence = rows[0].valor + 1;
    assert(sequence <= 999, 409, 'Limite diário de 999 senhas deste tipo atingido.');
    await connection.execute('UPDATE sequencias SET valor=? WHERE data_operacao=? AND tipo=?',
      [sequence, clock.date, type]);
    const [result] = await connection.execute(
      'INSERT INTO senhas (numero,data_operacao,tipo,sequencia,estado) VALUES (?,?,?,?,?)',
      [ticketNumber(clock.date, type, sequence), clock.date, type, sequence, 'EMITIDA']);
    await event(connection, result.insertId, 'EMITIDA');
    await connection.execute('UPDATE senhas SET estado=? WHERE id=?', ['AGUARDANDO', result.insertId]);
    await event(connection, result.insertId, 'AGUARDANDO');
    return load(connection, result.insertId);
  }, now);
}
export async function callNext(userId, counterValue, now) {
  const counter = positiveId(counterValue);
  return queueTransaction(async (connection, clock) => {
    assert(clock.open, 409, 'Novas chamadas disponíveis das 07h às 17h.');
    const [counters] = await connection.execute('SELECT id FROM guiches WHERE id=? AND ativo=1', [counter]);
    assert(counters.length, 404, 'Guichê não encontrado ou inativo.');
    const [busy] = await connection.execute(
      "SELECT id FROM senhas WHERE estado IN ('CHAMADA','CHAMADA_NOVAMENTE','EM_ATENDIMENTO') " +
      'AND (atendente_id=? OR guiche_id=?) LIMIT 1', [userId, counter]);
    assert(!busy.length, 409, 'Atendente ou guichê já possui uma senha ativa.');
    await connection.execute(
      'INSERT INTO alternancia (data_operacao,ultimo_tipo) VALUES (?,NULL) ON DUPLICATE KEY UPDATE data_operacao=data_operacao',
      [clock.date]);
    const [daily] = await connection.execute('SELECT ultimo_tipo FROM alternancia WHERE data_operacao=?', [clock.date]);
    let chosen;
    for (const type of priorityOrder(daily[0].ultimo_tipo)) {
      const [rows] = await connection.execute(
        "SELECT id,tipo FROM senhas WHERE data_operacao=? AND tipo=? AND estado='AGUARDANDO' " +
        'ORDER BY sequencia LIMIT 1 FOR UPDATE', [clock.date, type]);
      if (rows.length) { chosen = rows[0]; break; }
    }
    assert(chosen, 404, 'Não há senhas aguardando.');
    await connection.execute(
      "UPDATE senhas SET estado='CHAMADA',atendente_id=?,guiche_id=?,primeira_chamada_em=UTC_TIMESTAMP(3) WHERE id=?",
      [userId, counter, chosen.id]);
    await connection.execute('UPDATE alternancia SET ultimo_tipo=? WHERE data_operacao=?', [chosen.tipo, clock.date]);
    await event(connection, chosen.id, 'CHAMADA', userId);
    return load(connection, chosen.id);
  }, now);
}
export async function changeState(userId, idValue, action, now) {
  const id = positiveId(idValue);
  const transition = Object.hasOwn(transitions, action) ? transitions[action] : null;
  assert(transition, 400, 'Ação inválida.');
  return queueTransaction(async (connection, clock) => {
    const [rows] = await connection.execute('SELECT * FROM senhas WHERE id=? FOR UPDATE', [id]);
    const ticket = rows[0];
    assert(ticket, 404, 'Senha não encontrada.');
    assert(ticket.atendente_id === userId, 403, 'Esta senha pertence a outro atendente.');
    assert(transition.from.includes(ticket.estado), 409, 'Transição inválida para o estado atual.');
    assert(action === 'finalizar' || (clock.open && ticket.data_operacao === clock.date),
      409, 'Expediente encerrado. Apenas atendimentos iniciados podem ser finalizados.');
    // Esta coluna vem de uma constante interna, nunca do texto do cliente.
    const timestamp = transition.column ? ', ' + transition.column + '=UTC_TIMESTAMP(3)' : '';
    await connection.execute('UPDATE senhas SET estado=?' + timestamp + ' WHERE id=?', [transition.to, id]);
    await event(connection, id, transition.to, userId);
    return load(connection, id);
  }, now);
}
export async function expireQueue(now) {
  return queueTransaction(async (connection, clock) => {
    const [rows] = await connection.execute(
      "SELECT id FROM senhas WHERE estado IN ('EMITIDA','AGUARDANDO','CHAMADA','CHAMADA_NOVAMENTE') " +
      'AND (data_operacao<? OR (data_operacao=? AND ?=1)) FOR UPDATE',
      [clock.date, clock.date, clock.closed ? 1 : 0]);
    for (const row of rows) {
      await connection.execute("UPDATE senhas SET estado='DESCARTADA' WHERE id=?", [row.id]);
      await event(connection, row.id, 'DESCARTADA');
    }
    return rows.length;
  }, now);
}
export async function currentTicket(userId) {
  const [rows] = await pool.execute(
    "SELECT * FROM senhas WHERE atendente_id=? AND estado IN ('CHAMADA','CHAMADA_NOVAMENTE','EM_ATENDIMENTO') LIMIT 1",
    [userId]);
  return serialize(rows[0]);
}
export async function panel() {
  const [rows] = await pool.execute(
    "SELECT e.id AS evento_id,e.estado,e.ocorrido_em,s.numero,s.tipo,s.sequencia,g.numero AS guiche " +
    "FROM eventos e JOIN senhas s ON s.id=e.senha_id JOIN guiches g ON g.id=s.guiche_id " +
    "WHERE e.estado IN ('CHAMADA','CHAMADA_NOVAMENTE') ORDER BY e.id DESC LIMIT 5");
  return rows.map(serialize);
}
