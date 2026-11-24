export const TYPES = ['SP', 'SE', 'SG'];
// Entre duas senhas comuns, dá preferência a SP quando houver.
// SE e SG se alternam nas oportunidades seguintes para nenhuma fila ficar esquecida.
export function priorityOrder(lastType, lastSecondaryType = null) {
  if (lastType === 'SP') {
    return lastSecondaryType === 'SE' ? ['SG', 'SE', 'SP'] : ['SE', 'SG', 'SP'];
  }
  if (lastType === 'SE') return ['SP', 'SG', 'SE'];
  if (lastType === 'SG') return ['SP', 'SE', 'SG'];
  return ['SP', 'SE', 'SG'];
}
// A segunda chamada é opcional se o cliente chegou na primeira.
export const transitions = {
  rechamar: { from: ['CHAMADA'], to: 'CHAMADA_NOVAMENTE', column: 'segunda_chamada_em' },
  iniciar: { from: ['CHAMADA', 'CHAMADA_NOVAMENTE'], to: 'EM_ATENDIMENTO', column: 'inicio_em' },
  finalizar: { from: ['EM_ATENDIMENTO'], to: 'ATENDIDA', column: 'fim_em' },
  ausente: { from: ['CHAMADA_NOVAMENTE'], to: 'NAO_COMPARECEU', column: null }
};
