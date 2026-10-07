import type { RequestHandler } from 'express';

// API_SPEC.md mục 8: GET công khai cache 60 giây, response quản trị không cache

/** GET công khai. Nếu request đã xác thực admin (vd `includeInactive=true`) thì không cache. */
export const publicCache: RequestHandler = (req, res, next) => {
  res.setHeader('Cache-Control', req.admin ? 'no-store' : 'public, max-age=60');
  next();
};

/** Response quản trị hoặc chứa dữ liệu nhạy cảm (token) */
export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};
