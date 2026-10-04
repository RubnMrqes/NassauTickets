import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
export function Attendant({ session }) {
  const [counters, setCounters] = useState([]);
  const [counter, setCounter] = useState('');
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const token = session.token;
  useEffect(() => {
    let active = true;
    Promise.all([api('/guiches', { token }), api('/atendimento/atual', { token })])
      .then(([rows, current]) => {
        if (!active) return;
        setCounters(rows); setCounter(String(current?.guiche_id || rows[0]?.id || ''));
        setTicket(current); setReady(true);
      }).catch(error => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [token]);
  async function action(name) {
    setBusy(true); setError('');
    try {
      const path = name === 'proximo' ? '/atendimento/proximo' : '/senhas/' + ticket.id + '/' + name;
      const row = await api(path, { method: 'POST', token, body: name === 'proximo' ? { guicheId: Number(counter) } : {} });
      setTicket(['ATENDIDA','NAO_COMPARECEU'].includes(row.estado) ? null : row);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  const state = ticket?.estado;
  return <section>
    <h2>Atendimento — {session.usuario.nome}</h2>
    <label>Guichê <select disabled={!!ticket || busy} value={counter} onChange={event => setCounter(event.target.value)}>
      {counters.map(row => <option key={row.id} value={row.id}>{row.numero}</option>)}</select></label>
    {ticket && <p><strong>{ticket.numero}</strong> — {state}</p>}
    <div className="actions">
      <button disabled={!ready || busy || !!ticket || !counter} onClick={() => action('proximo')}>Chamar próxima</button>
      <button disabled={busy || state !== 'CHAMADA'} onClick={() => action('rechamar')}>Chamar novamente</button>
      <button disabled={busy || !['CHAMADA','CHAMADA_NOVAMENTE'].includes(state)} onClick={() => action('iniciar')}>Iniciar</button>
      <button disabled={busy || state !== 'EM_ATENDIMENTO'} onClick={() => action('finalizar')}>Finalizar</button>
      <button disabled={busy || state !== 'CHAMADA_NOVAMENTE'} onClick={() => action('ausente')}>Registrar ausência</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {!ready && <p>Carregamento incompleto. Reabra esta aba para tentar novamente.</p>}
  </section>;
}
