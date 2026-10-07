import type { ErrorRequestHandler } from 'express';

import { AppError, ErrorCode } from '@/shared/errors';

interface BodyParserError extends Error {
  type?: string;
}

function toAppError(err: unknown): AppError | undefined {
  if (err instanceof AppError) return err;
  const type = (err as BodyParserError | undefined)?.type;
  if (type === 'entity.parse.failed') {
    return new AppError(ErrorCode.INVALID_JSON, 'JSON sai cú pháp', 400);
  }
  if (type === 'entity.too.large') {
    return new AppError(ErrorCode.PAYLOAD_TOO_LARGE, 'Dữ liệu gửi lên quá lớn', 413);
  }
  return undefined;
}

// Middleware lỗi DUY NHẤT, luôn gắn cuối cùng. Không bao giờ trả stack trace.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = toAppError(err);

  if (!appError || appError.statusCode >= 500) {
    req.log.error({ err }, 'request.failed');
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Lỗi hệ thống, vui lòng thử lại sau' },
    });
    return;
  }

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    },
  });
};
