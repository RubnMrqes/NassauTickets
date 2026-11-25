const now = new Date();
const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: '2-digit', month: '2-digit', day: '2-digit'
}).formatToParts(now);
const date = Object.fromEntries(parts.map(part => [part.type, part.value]));
const prefix = `${date.year}${date.month}${date.day}`;

export const sampleQueue = [
  { id: -1, numero: `${prefix}-SP001`, tipo: 'SP', estado: 'AGUARDANDO' },
  { id: -2, numero: `${prefix}-SE001`, tipo: 'SE', estado: 'AGUARDANDO' },
  { id: -3, numero: `${prefix}-SG001`, tipo: 'SG', estado: 'AGUARDANDO' }
];

export const sampleCalls = [
  { evento_id: -1, numero: `${prefix}-SP001`, tipo: 'SP', sequencia: 1, guiche: 1, estado: 'CHAMADA' },
  { evento_id: -2, numero: `${prefix}-SG001`, tipo: 'SG', sequencia: 1, guiche: 2, estado: 'CHAMADA_NOVAMENTE' }
];
