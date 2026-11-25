import { useState } from 'react';
import { api } from '../services/api.js';

const types = [['SP', 'Prioritária'], ['SE', 'Retirada de exames'], ['SG', 'Geral']];

export function Totem() {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastType, setLastType] = useState(null);

  async function issue(tipo) {
    setBusy(true);
    setTicket(null);
    setError('');
    setLastType(tipo);
    try {
      setTicket(await api('/senhas', { method: 'POST', body: { tipo } }));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <section>
    <p className="eyebrow">Totem de atendimento</p>
    <h2>Retire sua senha</h2>
    <p>Escolha o serviço que você precisa. A senha é registrada no sistema e aparecerá no painel quando for chamada.</p>
    <div className="actions">
      {types.map(([type, label]) => <button key={type} disabled={busy} onClick={() => issue(type)}>{label}</button>)}
    </div>
    {busy && <p role="status">Emitindo senha...</p>}
    {ticket && <div className="issued-ticket" role="status">
      <span>Sua senha</span><strong>{ticket.numero}</strong><p>Aguarde a chamada no painel.</p>
    </div>}
    {error && <div className="network-feedback">
      <p role="alert">{error}</p>
      <button disabled={busy} onClick={() => issue(lastType)}>Tentar novamente</button>
    </div>}
  </section>;
}
