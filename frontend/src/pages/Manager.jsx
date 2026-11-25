import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDuration } from '../utils/report.js';

const typeLabels = { SP: 'Prioritária', SE: 'Retirada de exames', SG: 'Geral' };

function dateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Recife' });
}

function ReportView({ report }) {
  const cards = [
    ['Emitidas', report.resumo.emitidas],
    ['Atendidas', report.resumo.atendidas],
    ['Não compareceram', report.resumo.nao_compareceram],
    ['Taxa de não comparecimento', report.resumo.taxa_nao_comparecimento_pct + '%'],
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
    <h4 id="report-details-title">Detalhamento das senhas</h4>
    <div className="table-scroll" role="region" aria-labelledby="report-details-title" tabIndex="0">
      {report.detalhado.length ? <table>
        <thead><tr><th>Número</th><th>Tipo</th><th>Estado</th><th>Emissão</th><th>Atendimento</th><th>Guichê</th></tr></thead>
        <tbody>{report.detalhado.map(row => <tr key={row.numero}>
          <td>{row.numero}</td><td>{typeLabels[row.tipo] || row.tipo}</td><td>{row.estado}</td>
          <td>{dateTime(row.emitida_em)}</td><td>{dateTime(row.atendimento_em)}</td>
          <td>{row.guiche ?? '—'}</td>
        </tr>)}</tbody>
      </table> : <p>Não há senhas nesse período.</p>}
    </div>
    <h4 id="report-audit-title">Auditoria de atendimento</h4>
    <div className="table-scroll" role="region" aria-labelledby="report-audit-title" tabIndex="0">
      {report.auditoria.length ? <table>
        <thead><tr><th>Senha</th><th>Atendente</th><th>Guichê</th><th>1ª chamada</th><th>2ª chamada</th><th>Início</th><th>Fim</th></tr></thead>
        <tbody>{report.auditoria.map(row => <tr key={row.numero}>
          <td>{row.numero}</td><td>{row.atendente || '—'}</td><td>{row.guiche ?? '—'}</td>
          <td>{dateTime(row.primeira_chamada_em)}</td><td>{dateTime(row.segunda_chamada_em)}</td>
          <td>{dateTime(row.inicio_em)}</td><td>{dateTime(row.fim_em)}</td>
        </tr>)}</tbody>
      </table> : <p>Não há eventos de auditoria nesse período.</p>}
    </div>
  </article>;
}

export function Manager() {
  const { request } = useAuth();
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
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    run(async () => { await request('/usuarios', { method: 'POST', body }); form.reset(); setMessage('Atendente criado.'); });
  }
  function counter(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    run(async () => { await request('/guiches', { method: 'POST', body }); form.reset(); setMessage('Guichê criado.'); });
  }
  return <section><p className="eyebrow">Área do gestor</p><h2>Gestão</h2>
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
      setReport(await request('/relatorios?periodo=' + encodeURIComponent(period)))); }}>
      <h3>Relatório diário ou mensal</h3>
      <label>Período<input placeholder="AAAA-MM ou AAAA-MM-DD" value={period} onChange={event => setPeriod(event.target.value)} required /></label>
      <button disabled={busy}>Consultar</button>
    </form>
    {busy && <p role="status">Processando solicitação...</p>}
    {message && <p role={message.includes('criado.') ? 'status' : 'alert'}>{message}</p>}
    {report && <ReportView report={report} />}
  </section>;
}
