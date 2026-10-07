import { pino } from 'pino';

import { env } from '@/config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  enabled: env.NODE_ENV !== 'test',
  // Dev: pino-pretty cho log dễ đọc, link bấm được; ẩn khối req/res để mỗi request chỉ một dòng
  // (message đã có method, url, status, thời gian). Production giữ JSON đầy đủ cho công cụ thu log.
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname,req,res,responseTime,requestId',
      },
    },
  }),
  redact: {
    paths: [
      'password',
      'password_hash',
      'passwordHash',
      'token',
      'accessToken',
      '*.password',
      '*.password_hash',
      '*.passwordHash',
      '*.currentPassword',
      '*.newPassword',
      '*.token',
      '*.accessToken',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
});

export type Logger = typeof logger;
