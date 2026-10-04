import { transaction, pool } from '../src/db.js';
import { hashPassword } from '../src/services/password.js';
import { credentials, assert } from '../src/domain/errors.js';

try {
  const { email, password } = credentials({
    email: process.env.BOOTSTRAP_EMAIL,
    senha: process.env.BOOTSTRAP_PASSWORD
  });

  const name = String(
    process.env.BOOTSTRAP_NAME || 'Gestor'
  ).trim();

  assert(
    name.length >= 2 && name.length <= 100,
    400,
    'Nome do gestor inválido.'
  );

  await transaction(async (connection) => {
    await connection.execute(
      'SELECT id FROM controle_fila WHERE id = 1 FOR UPDATE'
    );

    const [existing] = await connection.execute(
      'SELECT id FROM usuarios WHERE gestor = 1'
    );

    if (existing.length === 0) {
      const passwordHash = await hashPassword(password);

      await connection.execute(
        'INSERT INTO usuarios (nome, email, senha_hash, gestor) VALUES (?, ?, ?, 1)',
        [name, email, passwordHash]
      );

      console.log('Gestor criado com sucesso.');
    } else {
      console.log('Gestor já existe.');
    }

    const counters = [1, 2, 3];

    for (const number of counters) {
      await connection.execute(
        `INSERT INTO guiches (numero)
         VALUES (?)
         ON DUPLICATE KEY UPDATE numero = numero`,
        [number]
      );
    }
  });

  console.log('Carga inicial concluída.');
} finally {
  await pool.end();
}