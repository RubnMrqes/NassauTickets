export function RequestFeedback({ status, error, onRetry, onSample, sampleMode = false }) {
  if (status === 'loading') return <p role="status">Carregando informações...</p>;
  if (status === 'error') return <div className="network-feedback">
    <p role="alert">{error || 'Não foi possível carregar as informações.'}</p>
    <div className="actions">
      <button onClick={onRetry}>Tentar novamente</button>
      {onSample && <button className="secondary" onClick={onSample}>Ver dados de demonstração</button>}
    </div>
  </div>;
  if (sampleMode) return <p className="sample-notice" role="status">Modo de demonstração: estes dados são locais e não foram consultados no MySQL.</p>;
  return null;
}
