import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';
import { sampleCalls } from '../data/contingencia.js';
import { RequestFeedback } from './RequestFeedback.jsx';

const types = { SP: 'Prioritária', SE: 'Retirada de exames', SG: 'Geral' };

export function Panel() {
  const [calls, setCalls] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [audio, setAudio] = useState(false);
  const [sampleMode, setSampleMode] = useState(false);
  const [updated, setUpdated] = useState(null);
  const [retry, setRetry] = useState(0);
  const seen = useRef(null);

  useEffect(() => {
    let stopped = false;
    let waiting = false;

    async function refresh() {
      if (waiting) return;
      waiting = true;
      try {
        const rows = await api('/painel');
        if (stopped) return;
        if (seen.current !== null && audio && 'speechSynthesis' in window) {
          const newCalls = [...rows].reverse().filter(row => row.evento_id > seen.current);
          for (const row of newCalls) {
            const intro = row.estado === 'CHAMADA_NOVAMENTE' ? 'Última chamada. ' : '';
            const speech = new SpeechSynthesisUtterance(
              `${intro}Senha ${types[row.tipo]}, ${row.sequencia}. Guichê ${row.guiche}.`
            );
            speech.lang = 'pt-BR';
            window.speechSynthesis.speak(speech);
          }
        }
        seen.current = Math.max(seen.current || 0, ...rows.map(row => row.evento_id));
        setCalls(rows);
        setUpdated(new Date());
        setSampleMode(false);
        setError('');
        setStatus('success');
      } catch (error) {
        if (!stopped) {
          setError(error.message);
          if (!sampleMode) setStatus('error');
        }
      } finally {
        waiting = false;
      }
    }

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => { stopped = true; clearInterval(interval); };
  }, [audio, retry, sampleMode]);

  function showSample() {
    seen.current = null;
    setCalls(sampleCalls);
    setSampleMode(true);
    setStatus('success');
  }

  return <section>
    <p className="eyebrow">Acompanhamento em tempo real</p>
    <h2>Painel de chamadas</h2>
    <div className="actions">
      <button className="secondary" onClick={() => setAudio(value => !value)}>{audio ? 'Desativar áudio' : 'Ativar áudio'}</button>
      <button className="secondary" onClick={() => setRetry(value => value + 1)}>Atualizar agora</button>
    </div>
    <RequestFeedback status={status} error={error} onRetry={() => setRetry(value => value + 1)} onSample={showSample} sampleMode={sampleMode} />
    {status === 'success' && <>
      {updated && !sampleMode && <p className="muted">Atualizado às {updated.toLocaleTimeString('pt-BR')}.</p>}
      {calls.length ? <ol className="calls" aria-live="polite">{calls.map(row => <li key={row.evento_id}>
        <strong>{row.numero}</strong><span>Guichê {row.guiche}</span>
        {row.estado === 'CHAMADA_NOVAMENTE' && <small>Última chamada</small>}
      </li>)}</ol> : <p className="empty">Ainda não há chamadas registradas.</p>}
    </>}
  </section>;
}
