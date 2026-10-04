import { useState } from 'react';
import { api } from '../services/api.js';
export function Totem() {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function issue(tipo) {
    setBusy(true); setError('');
    try { setTicket(await api('/senhas', { method: 'POST', body: { tipo } })); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <section>
    <h2>Retire sua senha</h2>
    <div className="actions">{[['SP','Prioritária'],['SE','Retirada de exames'],['SG','Geral']]
      .map(([type, label]) => <button key={type} disabled={busy} onClick={() => issue(type)}>{label}</button>)}</div>
    {ticket && <p role="status">Sua senha: <strong>{ticket.numero}</strong>. Aguarde no painel.</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
