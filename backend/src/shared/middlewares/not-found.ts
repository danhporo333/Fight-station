import type { RequestHandler } from 'express';

import { AppError, ErrorCode } from '@/shared/errors';

export const notFound: RequestHandler = (req) => {
  throw new AppError(ErrorCode.ROUTE_NOT_FOUND, `Không có endpoint ${req.method} ${req.path}`, 404);
};
