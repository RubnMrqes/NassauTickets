import { useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Panel } from './components/Panel.jsx';
import { Totem } from './pages/Totem.jsx';
import { Attendant } from './pages/Attendant.jsx';
import { Manager } from './pages/Manager.jsx';

function Home() {
  return <section className="home">
    <p className="eyebrow">Atendimento de laboratório</p>
    <h2>Organização e agilidade na hora de atender</h2>
    <p>Emita sua senha, acompanhe as chamadas no painel e gerencie os atendimentos em um só lugar.</p>
    <div className="home-links">
      <NavLink to="/totem"><strong>Retirar senha</strong><span>Escolha o tipo de atendimento.</span></NavLink>
      <NavLink to="/painel"><strong>Painel de chamadas</strong><span>Veja as últimas senhas chamadas.</span></NavLink>
      <NavLink to="/atendimento"><strong>Área do atendente</strong><span>Acesse a fila e os controles do guichê.</span></NavLink>
    </div>
  </section>;
}

function Login() {
  const { session, login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/atendimento';

  if (session?.usuario) return <Navigate to={destination} replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, senha);
      navigate(destination, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="auth-card">
    <h2>Entrar no sistema</h2>
    <p>Use a conta cadastrada pelo gestor do laboratório.</p>
    <form onSubmit={submit}>
      <label>E-mail<input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required maxLength={190} /></label>
      <label>Senha<input type="password" autoComplete="current-password" value={senha} onChange={event => setSenha(event.target.value)} required minLength={12} maxLength={128} /></label>
      <button disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
    </form>
    {error && <p role="alert">{error}</p>}
  </section>;
}

function Protected({ managerOnly = false, children }) {
  const { session, status, warning, restore, clearSession } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <section role="status">Verificando sua sessão...</section>;
  if (status === 'error') return <section>
    <h2>Não foi possível validar sua sessão</h2>
    <p role="alert">{warning}</p>
    <div className="actions">
      <button onClick={() => restore(session?.token)}>Tentar novamente</button>
      <button className="secondary" onClick={clearSession}>Voltar ao login</button>
    </div>
  </section>;
  if (!session?.usuario) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (managerOnly && !session.usuario.gestor) return <section><h2>Acesso restrito</h2><p role="alert">Esta área é exclusiva do gestor.</p></section>;
  return children;
}

function Layout() {
  const { session, logout, warning } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return <main>
    <header className="site-header">
      <NavLink to="/" className="brand"><span>Laboratório de análises clínicas</span><strong>nassauTickets</strong></NavLink>
      <div className="account">
        {session?.usuario && <span>Olá, {session.usuario.nome}</span>}
        {session?.usuario ? <button className="secondary" onClick={signOut}>Sair</button> : <NavLink className="button-link" to="/login">Entrar</NavLink>}
      </div>
    </header>
    <nav aria-label="Áreas do sistema">
      <NavLink to="/" end>Início</NavLink>
      <NavLink to="/totem">Totem</NavLink>
      <NavLink to="/painel">Painel</NavLink>
      <NavLink to="/atendimento">Atendente</NavLink>
      {session?.usuario?.gestor && <NavLink to="/gestao">Gestão</NavLink>}
    </nav>
    {warning && !session && <p role="alert">{warning}</p>}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/totem" element={<Totem />} />
      <Route path="/painel" element={<Panel />} />
      <Route path="/login" element={<Login />} />
      <Route path="/atendimento" element={<Protected><Attendant /></Protected>} />
      <Route path="/gestao" element={<Protected managerOnly><Manager /></Protected>} />
      <Route path="*" element={<section><h2>Página não encontrada</h2><NavLink to="/">Voltar ao início</NavLink></section>} />
    </Routes>
  </main>;
}

export function App() {
  return <BrowserRouter><AuthProvider><Layout /></AuthProvider></BrowserRouter>;
}
