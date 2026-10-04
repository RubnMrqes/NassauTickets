import { useState } from 'react';
import { api } from './services/api.js';
import { Panel } from './components/Panel.jsx';
import { Totem } from './pages/Totem.jsx';
import { Attendant } from './pages/Attendant.jsx';
import { Manager } from './pages/Manager.jsx';
export function App() {
  const [page, setPage] = useState('totem');
  // Sessão em memória: recarregar a página exige novo login.
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function login(event) {
    event.preventDefault(); setError(''); setBusy(true);
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try { setSession(await api('/auth/login', { method: 'POST', body })); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError('');
    try { await api('/auth/logout', { method: 'POST', token: session.token }); setSession(null); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <main>
    <header><p>Laboratório de análises clínicas</p><h1>nassauTickets</h1></header>
    <nav aria-label="Áreas do sistema">
      {[['totem','Totem'],['painel','Painel'],['atendente','Atendente']].map(([key,label]) =>
        <button key={key} aria-pressed={page === key} onClick={() => setPage(key)}>{label}</button>)}
    </nav>
    {page === 'totem' && <Totem />}
    {page === 'painel' && <Panel />}
    {page === 'atendente' && (session ? <>
      <button disabled={busy} onClick={logout}>Sair</button>
      <Attendant session={session} />
      {session.usuario.gestor && <Manager token={session.token} />}
    </> : <section><h2>Entrar como atendente</h2><form onSubmit={login}>
      <label>E-mail<input name="email" type="email" autoComplete="username" required /></label>
      <label>Senha<input name="senha" type="password" autoComplete="current-password" required minLength={12} maxLength={128} /></label>
      <button disabled={busy}>Entrar</button>
    </form></section>)}
    {error && <p role="alert">{error}</p>}
  </main>;
}
