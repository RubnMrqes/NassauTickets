export const TYPES = ['SP', 'SE', 'SG'];
// Alternância GLOBAL por dia: após SP, SE e SG têm sua oportunidade.
export function priorityOrder(lastType) {
  return lastType === 'SP' ? ['SE', 'SG', 'SP'] : ['SP', 'SE', 'SG'];
}
// A segunda chamada é opcional se o cliente chegou na primeira.
export const transitions = {
  rechamar: { from: ['CHAMADA'], to: 'CHAMADA_NOVAMENTE', column: 'segunda_chamada_em' },
  iniciar: { from: ['CHAMADA', 'CHAMADA_NOVAMENTE'], to: 'EM_ATENDIMENTO', column: 'inicio_em' },
  finalizar: { from: ['EM_ATENDIMENTO'], to: 'ATENDIDA', column: 'fim_em' },
  ausente: { from: ['CHAMADA_NOVAMENTE'], to: 'NAO_COMPARECEU', column: null }
};
