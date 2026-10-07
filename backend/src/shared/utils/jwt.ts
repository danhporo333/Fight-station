import jwt, { type SignOptions } from 'jsonwebtoken';

import { config } from '@/config';
import type { AdminRole } from '@/shared/types/express';

const ALGORITHM = 'HS256';
const ROLES: readonly AdminRole[] = ['owner', 'staff'];

/** Payload JWT theo API_SPEC.md mục 2: `{ sub: adminUserId, role }` */
export interface AccessTokenPayload {
  sub: number;
  role: AdminRole;
}

export type VerifyTokenResult =
  { ok: true; payload: AccessTokenPayload } | { ok: false; reason: 'expired' | 'invalid' };

export function signAccessToken(payload: AccessTokenPayload): {
  accessToken: string;
  expiresIn: number;
} {
  // jsonwebtoken bắt `sub` phải là chuỗi; đọc ra thì đổi lại thành số
  const accessToken = jwt.sign({ role: payload.role }, config.jwt.secret, {
    algorithm: ALGORITHM,
    subject: String(payload.sub),
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  });
  const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
  return { accessToken, expiresIn: (decoded.exp ?? 0) - (decoded.iat ?? 0) };
}

export function verifyAccessToken(token: string): VerifyTokenResult {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: [ALGORITHM] });
    if (typeof decoded === 'string') return { ok: false, reason: 'invalid' };
    const sub = Number(decoded.sub);
    const role = decoded.role as AdminRole;
    if (!Number.isInteger(sub) || sub <= 0 || !ROLES.includes(role)) {
      return { ok: false, reason: 'invalid' };
    }
    return { ok: true, payload: { sub, role } };
  } catch (err) {
    return { ok: false, reason: err instanceof jwt.TokenExpiredError ? 'expired' : 'invalid' };
  }
}
