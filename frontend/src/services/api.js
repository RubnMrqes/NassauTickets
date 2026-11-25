export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, token } = {}) {
  let response;

  try {
    response = await fetch(API_URL + path, {
      method,
      signal: AbortSignal.timeout(8000),
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new ApiError('A solicitação demorou demais. Verifique a conexão e tente novamente.');
    }
    throw new ApiError('Não foi possível conectar à API. Confira se o servidor está iniciado.');
  }

  if (response.status === 204) return null;

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const standard = {
      401: 'Sua sessão expirou. Faça login novamente.',
      403: 'Você não tem permissão para esta operação.',
      404: 'Informação não encontrada.',
      503: 'O servidor está indisponível. Tente novamente.'
    };
    throw new ApiError(result?.erro || standard[response.status] || 'Não foi possível concluir a solicitação.', response.status);
  }

  if (result === null) throw new ApiError('O servidor retornou uma resposta inválida.');
  return result;
}
