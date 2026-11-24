import 'dotenv/config';
export const config = {
  port: Number(process.env.PORT || 3001),
  origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value => value.trim()),
  demoMode: process.env.DEMO_MODE === 'true',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'nassau_tickets',
    user: process.env.DB_USER || 'nassau_app',
    password: process.env.DB_PASSWORD || '',
    timezone: 'Z',
    dateStrings: true,
    connectionLimit: 10,
    waitForConnections: true
  }
};
