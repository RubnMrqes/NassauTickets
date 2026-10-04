const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export async function api(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(base + path, {
    method, signal: AbortSignal.timeout(8000),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.erro || 'Falha na requisição.');
  return data;
}
