import type { Response } from 'express';

import type { PaginationMeta } from '@/shared/types/pagination';

// Envelope chuẩn (API_SPEC.md mục 4). Controller chỉ dùng các helper này, không tự dựng JSON.
export function ok<T>(res: Response, data: T, meta?: PaginationMeta): Response {
  return res.status(200).json(meta ? { success: true, data, meta } : { success: true, data });
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json({ success: true, data });
}

export function noContent(res: Response): Response {
  return res.status(204).end();
}
