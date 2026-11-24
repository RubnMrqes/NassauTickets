import { randomBytes } from 'node:crypto';
import { readFile, writeFile, access } from 'node:fs/promises';

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

const backendEnv = new URL('../.env', import.meta.url);
const frontendEnv = new URL('../../frontend/.env', import.meta.url);

if (await exists(backendEnv)) {
  console.log('backend/.env já existe. Configuração preservada.');
} else {
  const template = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
  const password = randomBytes(18).toString('base64url');
  const rootPassword = randomBytes(18).toString('base64url');
  const adminPassword = randomBytes(18).toString('base64url');
  const content = template
    .replace('DB_PASSWORD=troque_por_uma_senha_local', 'DB_PASSWORD=' + password)
    .replace('MYSQL_ROOT_PASSWORD=troque_por_outra_senha_local', 'MYSQL_ROOT_PASSWORD=' + rootPassword)
    .replace('BOOTSTRAP_EMAIL=gestor@example.test', 'BOOTSTRAP_EMAIL=gestor@local.test')
    .replace('BOOTSTRAP_NAME=Gestor de teste', 'BOOTSTRAP_NAME=Gestor')
    .replace('BOOTSTRAP_PASSWORD=', 'BOOTSTRAP_PASSWORD=' + adminPassword);
  await writeFile(backendEnv, content, { flag: 'wx', mode: 0o600 });
  console.log('Configuração criada em backend/.env');
  console.log('Login inicial: gestor@local.test');
  console.log('Senha inicial: ' + adminPassword);
  console.log('Guarde esta senha. Ela não será enviada ao Git.');
}

if (!(await exists(frontendEnv))) {
  const content = await readFile(new URL('../../frontend/.env.example', import.meta.url), 'utf8');
  await writeFile(frontendEnv, content, { flag: 'wx' });
  console.log('Configuração criada em frontend/.env');
}
