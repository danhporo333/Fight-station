import { env } from './env';

export { env };

export const config = {
  api: {
    prefix: '/api/v1',
    bodyLimit: '100kb',
  },
  cors: {
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    exposedHeaders: ['X-Request-Id'],
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },
  rateLimit: {
    api: { windowMs: 60 * 1000, limit: 300 },
    login: { windowMs: 15 * 60 * 1000, limit: 10 },
  },
};
