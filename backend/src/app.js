import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { router } from './routes.js';
export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: config.origin }));
app.use(express.json({ limit: '16kb' }));
app.use('/api', router);
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
// Quatro argumentos identificam o middleware de erro no Express.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Cadastro já existente.' });
  const status = error.status || 503;
  if (status >= 500) console.error('Falha interna:', error.code || error.name);
  res.status(status).json({ erro: status >= 500 ? 'Serviço indisponível. Tente novamente.' : error.message });
});
