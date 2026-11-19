import { rateLimit } from 'express-rate-limit';

import { config } from '@/config';
import { AppError, ErrorCode } from '@/shared/errors';

function createLimiter(options: {
  windowMs: number;
  limit: number;
  skipSuccessfulRequests?: boolean;
}) {
  return rateLimit({
    ...options,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new AppError(ErrorCode.TOO_MANY_REQUESTS, 'Bạn gọi quá nhiều lần, thử lại sau', 429));
    },
  });
}

/** Toàn bộ /api/v1: 300 lần / phút / IP */
export const apiRateLimit = createLimiter(config.rateLimit.api);

/** POST /auth/forgot-password và /auth/reset-password: 5 lần / 15 phút / IP (tính cả lần thành công) */
export const passwordResetRateLimit = createLimiter(config.rateLimit.passwordReset);

/** Riêng POST /auth/login: đăng nhập **sai** 10 lần / 15 phút / IP (lần đúng không bị tính) */
export const loginRateLimit = createLimiter({
  ...config.rateLimit.login,
  skipSuccessfulRequests: true,
});
