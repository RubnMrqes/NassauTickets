export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds === '') return '—';
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return '—';

  const total = Math.round(value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;

  if (hours) return `${hours} h ${minutes} min`;
  if (minutes) return `${minutes} min ${remainingSeconds} s`;
  return `${remainingSeconds} s`;
}
