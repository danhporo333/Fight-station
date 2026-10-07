import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

const HEADER = 'X-Request-Id';
const VALID_ID = /^[\w-]{1,100}$/;

// Nhận X-Request-Id từ proxy nếu hợp lệ, không thì tự sinh; trả lại trong response để tra log
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.get(HEADER);
  req.id = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader(HEADER, req.id);
  next();
};
