import type { IncomingMessage, ServerResponse } from 'node:http';

import { pinoHttp } from 'pino-http';

import { logger } from '@/core/logger';

// Express gắn originalUrl (url đầy đủ, kể cả khi đi qua router con)
type Req = IncomingMessage & { originalUrl?: string };

// Một dòng mỗi request: "POST /api/v1/auth/login 200 45ms". Lỗi (≥ 400) kèm requestId để tra log.
function summarize(req: Req, res: ServerResponse, suffix: string): string {
  const base = `${req.method} ${req.originalUrl ?? req.url} ${res.statusCode} ${suffix}`;
  return res.statusCode >= 400 ? `${base} [${String(req.id)}]` : base;
}

// Mỗi dòng log của request có requestId (trùng header X-Request-Id). Dùng req.log trong handler.
// Đối tượng req/res vẫn được ghi kèm (production đọc được); dev ẩn bớt ở core/logger.
export const requestLogger = pinoHttp({
  logger,
  // Dùng lại id do middleware request-id đã gắn (trùng header X-Request-Id)
  genReqId: (req) => req.id,
  customAttributeKeys: { reqId: 'requestId' },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res, responseTime) =>
    summarize(req, res, `${Math.round(responseTime)}ms`),
  customErrorMessage: (req, res, err) => summarize(req, res, `- ${err.message}`),
  autoLogging: { ignore: (req) => req.url === '/health' },
});
