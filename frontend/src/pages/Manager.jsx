import { useState } from 'react';
import { api } from '../services/api.js';
import { formatDuration } from '../utils/report.js';

const typeLabels = { SP: 'Prioritária', SE: 'Retirada de exames', SG: 'Geral' };

function ReportView({ report }) {
  const cards = [
    ['Emitidas', report.resumo.emitidas],
    ['Atendidas', report.resumo.atendidas],
    ['Não compareceram', report.resumo.nao_compareceram],
    ['Descartadas', report.resumo.descartadas],
    ['Tempo médio de atendimento', formatDuration(report.resumo.tempo_medio_segundos)]
  ];

  return <article className="report" aria-labelledby="report-title">
    <header className="report-header">
      <p>Período consultado</p>
      <h3 id="report-title">Relatório de {report.periodo}</h3>
    </header>
    <div className="report-summary" aria-label="Resumo geral">
      {cards.map(([label, value]) => <dl className="report-card" key={label}>
        <dt>{label}</dt><dd>{value}</dd>
      </dl>)}
    </div>
    <h4 id="report-types-title">Resultados por tipo de senha</h4>
    <div className="table-scroll" role="region" aria-labelledby="report-types-title" tabIndex="0">
      <table>
        <thead><tr>
          <th scope="col">Tipo</th>
          <th scope="col">Emitidas</th>
          <th scope="col">Atendidas</th>
          <th scope="col">Tempo médio de atendimento</th>
        </tr></thead>
        <tbody>{report.resumo.por_tipo.map(row => <tr key={row.tipo}>
          <th scope="row">{typeLabels[row.tipo] || row.tipo} <span className="type-code">({row.tipo})</span></th>
          <td>{row.emitidas}</td>
          <td>{row.atendidas}</td>
          <td>{formatDuration(row.tempo_medio_segundos)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </article>;
}

export function Manager({ token }) {
  const [period, setPeriod] = useState('');
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function run(work) {
    setBusy(true); setMessage('');
    try { await work(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  function user(event) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    run(async () => { await api('/usuarios', { method: 'POST', token, body }); setMessage('Atendente criado.'); });
  }
  function counter(event) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    run(async () => { await api('/guiches', { method: 'POST', token, body }); setMessage('Guichê criado.'); });
  }
  return <section><h2>Gestão</h2>
    <form onSubmit={user}><h3>Cadastrar atendente</h3>
      <label>Nome<input name="nome" required minLength={2} maxLength={100} /></label>
      <label>E-mail<input name="email" type="email" required /></label>
      <label>Senha inicial<input name="senha" type="password" required minLength={12} maxLength={128} /></label>
      <button disabled={busy}>Cadastrar atendente</button>
    </form>
    <form onSubmit={counter}><h3>Cadastrar guichê</h3>
      <label>Número<input name="numero" type="number" min={1} max={999} required /></label>
      <button disabled={busy}>Cadastrar guichê</button>
    </form>
    <form onSubmit={event => { event.preventDefault(); run(async () =>
      setReport(await api('/relatorios?periodo=' + encodeURIComponent(period), { token }))); }}>
      <h3>Relatório diário ou mensal</h3>
      <label>Período<input placeholder="2026-10 ou 2026-10-03" value={period} onChange={event => setPeriod(event.target.value)} required /></label>
      <button disabled={busy}>Consultar</button>
    </form>
    {message && <p role="status">{message}</p>}
    {report && <ReportView report={report} />}
  </section>;
}
