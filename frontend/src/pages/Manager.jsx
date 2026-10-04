import { useState } from 'react';
import { api } from '../services/api.js';
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
    {report && <pre>{JSON.stringify(report, null, 2)}</pre>}
  </section>;
}
