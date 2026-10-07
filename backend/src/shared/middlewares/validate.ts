import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { ValidationError } from '@/shared/errors';

type Source = 'body' | 'query' | 'params';

/**
 * Validate `req[source]` bằng Zod, thay bằng dữ liệu đã parse (trim, coerce, default).
 * ZodError → 400 COMMON_001 kèm `details` (`field` là đường dẫn, vd `features.0`).
 */
export function validate(schema: z.ZodType, source: Source = 'body'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
      );
    }
    if (source === 'body') {
      req.body = result.data;
    } else {
      // Express 5: req.query / req.params là getter, phải định nghĩa lại thuộc tính
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
      });
    }
    next();
  };
}
