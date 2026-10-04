const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit',
  day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});
export function businessClock(now = new Date()) {
  const parts = Object.fromEntries(formatter.formatToParts(now)
    .filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return {
    date: parts.year + '-' + parts.month + '-' + parts.day,
    open: minutes >= 7 * 60 && minutes < 17 * 60,
    closed: minutes >= 17 * 60
  };
}
export function ticketNumber(date, type, sequence) {
  return date.replaceAll('-', '').slice(2) + '-' + type + String(sequence).padStart(3, '0');
}
