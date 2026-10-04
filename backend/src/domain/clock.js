const formatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

const OPENING_TIME = 7 * 60;
const CLOSING_TIME = 17 * 60;

export function businessClock(now = new Date()) {
  const parts = Object.fromEntries(
    formatter
      .formatToParts(now)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const totalMinutes = hour * 60 + minute;

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    open: totalMinutes >= OPENING_TIME && totalMinutes < CLOSING_TIME,
    closed: totalMinutes >= CLOSING_TIME
  };
}

export function ticketNumber(date, type, sequence) {
  const dateWithoutSeparators = date.replaceAll('-', '').slice(2);
  const paddedSequence = String(sequence).padStart(3, '0');

  return `${dateWithoutSeparators}-${type}${paddedSequence}`;
}