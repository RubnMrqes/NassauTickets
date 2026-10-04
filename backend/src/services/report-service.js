import { pool, serialize } from '../db.js';
import { assert } from '../domain/errors.js';
export function reportRange(period) {
  assert(typeof period === 'string' && /^\d{4}-\d{2}(-\d{2})?$/.test(period),
    400, 'Use periodo=AAAA-MM-DD ou periodo=AAAA-MM.');
  const [year, month, day] = period.split('-').map(Number);
  assert(year >= 2000 && year <= 2099 && month >= 1 && month <= 12, 400, 'Período inválido.');
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  assert(!day || day >= 1 && day <= last, 400, 'Dia inválido.');
  assert(period.length !== 10 || day > 0, 400, 'Dia inválido.');
  return { start: day ? period : period + '-01', end: day ? period : period + '-' + last };
}
export async function report(period) {
  const { start, end } = reportRange(period);
  const [rows] = await pool.execute(
    'SELECT s.*,u.nome AS atendente,g.numero AS guiche FROM senhas s ' +
    'LEFT JOIN usuarios u ON u.id=s.atendente_id LEFT JOIN guiches g ON g.id=s.guiche_id ' +
    'WHERE data_operacao BETWEEN ? AND ? ORDER BY s.id', [start, end]);
  const details = rows.map(serialize);
  const attended = details.filter(row => row.estado === 'ATENDIDA');
  const averages = list => list.length
    ? list.reduce((sum, row) => sum + (new Date(row.fim_em) - new Date(row.inicio_em)) / 1000, 0) / list.length
    : null;
  return {
    periodo: period,
    resumo: {
      emitidas: details.length, atendidas: attended.length,
      nao_compareceram: details.filter(row => row.estado === 'NAO_COMPARECEU').length,
      descartadas: details.filter(row => row.estado === 'DESCARTADA').length,
      tempo_medio_segundos: averages(attended),
      por_tipo: ['SP', 'SE', 'SG'].map(tipo => ({
        tipo, emitidas: details.filter(row => row.tipo === tipo).length,
        atendidas: attended.filter(row => row.tipo === tipo).length,
        tempo_medio_segundos: averages(attended.filter(row => row.tipo === tipo))
      }))
    },
    detalhado: details.map(row => ({
      numero: row.numero, tipo: row.tipo, estado: row.estado, emitida_em: row.emitida_em,
      atendimento_em: row.estado === 'ATENDIDA' ? row.inicio_em : null,
      guiche: row.estado === 'ATENDIDA' ? row.guiche : null
    })),
    auditoria: details.map(row => ({
      numero: row.numero, estado: row.estado, atendente: row.atendente, guiche: row.guiche,
      primeira_chamada_em: row.primeira_chamada_em, segunda_chamada_em: row.segunda_chamada_em,
      inicio_em: row.inicio_em, fim_em: row.fim_em
    }))
  };
}
