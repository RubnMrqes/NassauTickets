import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { sampleQueue } from '../data/contingencia.js';
import { RequestFeedback } from '../components/RequestFeedback.jsx';

const labels = { SP: 'Prioritária', SE: 'Retirada de exames', SG: 'Geral' };
const statuses = {
  CHAMADA: 'Aguardando comparecimento',
  CHAMADA_NOVAMENTE: 'Chamado novamente',
  EM_ATENDIMENTO: 'Em atendimento'
};

export function Attendant() {
  const { session, request } = useAuth();
  const [counters, setCounters] = useState([]);
  const [counter, setCounter] = useState('');
  const [ticket, setTicket] = useState(null);
  const [queue, setQueue] = useState([]);
  const [status, setStatus] = useState('loading');
  const [sampleMode, setSampleMode] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);

  const reload = useCallback(async (full = false) => {
    if (full) setStatus('loading');
    try {
      const [rows, current, waiting] = await Promise.all([
        request('/guiches'), request('/atendimento/atual'), request('/fila')
      ]);
      setCounters(rows);
      setCounter(previous => String(current?.guiche_id || (rows.some(row => String(row.id) === previous) ? previous : rows[0]?.id || '')));
      setTicket(current);
      setQueue(waiting);
      setStatus('success');
      setError('');
      setSampleMode(false);
    } catch (error) {
      setError(error.message);
      setStatus('error');
    }
  }, [request]);

  useEffect(() => { reload(true); }, [reload, retry]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!busy && !sampleMode && status === 'success') reload(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [busy, sampleMode, status, reload]);

  async function action(name) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const path = name === 'proximo' ? '/atendimento/proximo' : `/senhas/${ticket.id}/${name}`;
      const row = await request(path, {
        method: 'POST', body: name === 'proximo' ? { guicheId: Number(counter) } : {}
      });
      setTicket(['ATENDIDA', 'NAO_COMPARECEU'].includes(row.estado) ? null : row);
      setMessage({ proximo: 'Senha chamada.', rechamar: 'Senha chamada novamente.', iniciar: 'Atendimento iniciado.', finalizar: 'Atendimento finalizado.', ausente: 'Ausência registrada.' }[name]);
      try {
        const waiting = await request('/fila');
        setQueue(waiting);
      } catch (error) {
        setError('Atendimento registrado, mas não foi possível atualizar a fila: ' + error.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  const state = ticket?.estado;
  return <section>
    <p className="eyebrow">Área protegida</p>
    <h2>Atendimento — {session.usuario.nome}</h2>
    <RequestFeedback status={status} error={error} onRetry={() => setRetry(value => value + 1)}
      onSample={() => { setQueue(sampleQueue); setSampleMode(true); setStatus('success'); }} sampleMode={sampleMode} />
    {status === 'success' && <>
      <div className="attendant-layout">
        <div>
          <h3>Controle do guichê</h3>
          <label>Guichê
            <select disabled={!!ticket || busy || sampleMode} value={counter} onChange={event => setCounter(event.target.value)}>
              {counters.map(row => <option key={row.id} value={row.id}>Guichê {row.numero}</option>)}
            </select>
          </label>
          <div className="active-ticket" role="status">
            {ticket ? <><span>Senha atual</span><strong>{ticket.numero}</strong><p>{statuses[state] || state}</p></> : <p>Nenhum atendimento em andamento.</p>}
          </div>
          <div className="actions">
            <button disabled={busy || sampleMode || !!ticket || !counter} onClick={() => action('proximo')}>Chamar próxima</button>
            <button disabled={busy || sampleMode || state !== 'CHAMADA'} onClick={() => action('rechamar')}>Chamar novamente</button>
            <button disabled={busy || sampleMode || !['CHAMADA', 'CHAMADA_NOVAMENTE'].includes(state)} onClick={() => action('iniciar')}>Iniciar</button>
            <button disabled={busy || sampleMode || state !== 'EM_ATENDIMENTO'} onClick={() => action('finalizar')}>Finalizar</button>
            <button disabled={busy || sampleMode || state !== 'CHAMADA_NOVAMENTE'} onClick={() => action('ausente')}>Registrar ausência</button>
          </div>
          {busy && <p role="status">Salvando alteração...</p>}
          {message && <p role="status" className="success-message">{message}</p>}
          {error && <div className="network-feedback"><p role="alert">{error}</p><button onClick={() => setRetry(value => value + 1)}>Atualizar informações</button></div>}
        </div>
        <div>
          <div className="heading-row"><h3>Fila de espera</h3><button className="secondary" disabled={busy} onClick={() => setRetry(value => value + 1)}>Atualizar</button></div>
          {queue.length ? <ul className="waiting-list">{queue.map(row => <li key={row.id}>
            <strong>{row.numero}</strong><span>{labels[row.tipo] || row.tipo}</span>
          </li>)}</ul> : <p className="empty">Não há senhas aguardando.</p>}
          {queue.length === 100 && !sampleMode && <p className="muted">Exibindo as primeiras 100 senhas.</p>}
        </div>
      </div>
    </>}
  </section>;
}
