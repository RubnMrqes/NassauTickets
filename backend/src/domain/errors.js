export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function assert(condition, status, message) {
  if (!condition) throw new AppError(status, message);
}
export function positiveId(value) {
  const number = Number(value);
  assert(Number.isSafeInteger(number) && number > 0, 400, 'ID inválido.');
  return number;
}
export function credentials(body) {
  const email = String(body?.email || '').trim().toLowerCase();
  const password = body?.senha;
  assert(email.length <= 190 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 400, 'E-mail inválido.');
  assert(typeof password === 'string' && password.length >= 12 && password.length <= 128,
    400, 'A senha deve conter entre 12 e 128 caracteres.');
  return { email, password };
}
