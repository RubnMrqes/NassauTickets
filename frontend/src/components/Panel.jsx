import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';

export function Panel() {
  const [calls, setCalls] = useState([]);
  const [error, setError] = useState('');
  const [audio, setAudio] = useState(false);
  const [updated, setUpdated] = useState(null);
  const seen = useRef(null);

  useEffect(() => {
    let stopped = false;
    let timer;
    async function refresh() {
      try {
        const rows = await api('/painel');
        if (stopped) return;
        // Na primeira leitura não reproduzimos chamadas antigas.
        if (seen.current !== null && audio && 'speechSynthesis' in window) {
          for (const row of [...rows].reverse().filter(row => row.evento_id > seen.current)) {
            const prefix = row.estado === 'CHAMADA_NOVAMENTE' ? 'Última chamada. ' : '';
            const type = { SP: 'Prioritária', SE: 'Retirada de exames', SG: 'Geral' }[row.tipo];
            const speech = new SpeechSynthesisUtterance(prefix + 'Senha ' + type + ', ' +
              row.sequencia + '. Guichê ' + row.guiche);
            speech.lang = 'pt-BR';
            window.speechSynthesis.speak(speech);
          }
        }
        seen.current = Math.max(seen.current || 0, ...rows.map(row => row.evento_id));
        setCalls(rows); setUpdated(new Date()); setError('');
      } catch {
        if (!stopped) setError('Painel sem conexão. As chamadas abaixo podem estar desatualizadas.');
      } finally {
        if (!stopped) timer = setTimeout(refresh, 2000);
      }
    }
    refresh();
    return () => { stopped = true; clearTimeout(timer); };
  }, [audio]);

  return <section>
    <h2>Painel de chamadas</h2>
    <button onClick={() => setAudio(value => !value)}>{audio ? 'Desativar áudio' : 'Ativar áudio'}</button>
    {error && <p role="alert">{error}</p>}
    {updated && <p>Última atualização: {updated.toLocaleTimeString('pt-BR')}</p>}
    <ol aria-live="polite">{calls.map(row => <li key={row.evento_id}>
      <strong>{row.numero}</strong> — Guichê {row.guiche}
      {row.estado === 'CHAMADA_NOVAMENTE' && ' — Última chamada'}
    </li>)}</ol>
    {!calls.length && <p>Nenhuma chamada registrada.</p>}
  </section>;
}
