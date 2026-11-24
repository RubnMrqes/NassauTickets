import 'dotenv/config';

const base = `http://127.0.0.1:${process.env.PORT || 3001}/api`;
const email = process.env.BOOTSTRAP_EMAIL;
const senha = process.env.BOOTSTRAP_PASSWORD;

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(base + path, {
    method,
    signal: AbortSignal.timeout(8000),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = response.status === 204 ? null : await response.json();
  return { status: response.status, data };
}

function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('OK — ' + message);
}

try {
  const health = await request('/health');
  check(health.status === 200 && health.data?.status === 'ok', 'API conectada ao MySQL');

  const blocked = await request('/fila');
  check(blocked.status === 401, 'rota protegida responde 401');

  const session = await request('/auth/login', { method: 'POST', body: { email, senha } });
  check(session.status === 200 && session.data?.token, 'login com conta inicial');
  const token = session.data.token;

  const me = await request('/auth/me', { token });
  check(me.status === 200 && me.data?.usuario?.email === email, 'sessão restaurada por token');

  const queue = await request('/fila', { token });
  check(queue.status === 200 && Array.isArray(queue.data), 'fila consultada no MySQL');

  const counters = await request('/guiches', { token });
  check(counters.status === 200 && counters.data.length >= 1, 'guichês disponíveis');

  const panel = await request('/painel');
  check(panel.status === 200 && Array.isArray(panel.data), 'painel consultado');

  const report = await request('/relatorios?periodo=2026-11', { token });
  check(report.status === 200 && report.data?.resumo, 'relatório de gestor acessível');

  const logout = await request('/auth/logout', { method: 'POST', token });
  check(logout.status === 204, 'logout concluído');

  const revoked = await request('/auth/me', { token });
  check(revoked.status === 401, 'token revogado após logout');
  console.log('Verificação concluída.');
} catch (error) {
  console.error('Falha na verificação:', error.message);
  process.exitCode = 1;
}
