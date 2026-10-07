import type { Request, RequestHandler } from 'express';

import { ErrorCode, ForbiddenError, UnauthorizedError } from '@/shared/errors';
import type { AdminRole, AuthAdmin } from '@/shared/types/express';
import { verifyAccessToken } from '@/shared/utils/jwt';

/**
 * Cách tra cứu admin mà guard cần. shared/ không được import features/, nên feature `auth`
 * cung cấp một service thỏa interface này và app.ts truyền vào createAuthGuards().
 */
export interface AdminLookup {
  findById(id: number): Promise<{ id: number; role: AdminRole; isActive: boolean } | null>;
}

export interface AuthGuards {
  /** Owner hoặc staff đã đăng nhập (API_SPEC: Admin) */
  requireAdmin: RequestHandler;
  /** Chỉ owner (API_SPEC: Owner) */
  requireOwner: RequestHandler;
  /** Có header Authorization thì xác thực như requireAdmin, không có thì cho qua (dùng cho includeInactive) */
  optionalAdmin: RequestHandler;
}

const BEARER = /^Bearer\s+(\S+)$/i;

export function createAuthGuards(lookup: AdminLookup): AuthGuards {
  async function authenticate(req: Request): Promise<AuthAdmin> {
    const match = BEARER.exec(req.get('Authorization') ?? '');
    if (!match?.[1]) {
      throw new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Bạn cần đăng nhập');
    }

    const result = verifyAccessToken(match[1]);
    if (!result.ok) {
      throw result.reason === 'expired'
        ? new UnauthorizedError(ErrorCode.AUTH_TOKEN_EXPIRED, 'Phiên đăng nhập đã hết hạn')
        : new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Token không hợp lệ');
    }

    // Đọc lại DB mỗi request: khóa tài khoản hoặc đổi quyền có hiệu lực ngay
    const admin = await lookup.findById(result.payload.sub);
    if (!admin) throw new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Token không hợp lệ');
    if (!admin.isActive) {
      throw new ForbiddenError(ErrorCode.AUTH_ACCOUNT_LOCKED, 'Tài khoản đã bị khóa');
    }
    return { id: admin.id, role: admin.role };
  }

  const requireAdmin: RequestHandler = async (req, res, next) => {
    req.admin = await authenticate(req);
    res.setHeader('Cache-Control', 'no-store');
    next();
  };

  const requireOwner: RequestHandler = async (req, res, next) => {
    const admin = await authenticate(req);
    if (admin.role !== 'owner') {
      throw new ForbiddenError(
        ErrorCode.AUTH_FORBIDDEN,
        'Chỉ chủ quán được thực hiện thao tác này',
      );
    }
    req.admin = admin;
    res.setHeader('Cache-Control', 'no-store');
    next();
  };

  const optionalAdmin: RequestHandler = async (req, _res, next) => {
    if (req.get('Authorization')) req.admin = await authenticate(req);
    next();
  };

  return { requireAdmin, requireOwner, optionalAdmin };
}

/** Lấy admin đã được guard gắn vào request; gọi ở controller của route có requireAdmin/requireOwner */
export function getRequestAdmin(req: Request): AuthAdmin {
  if (!req.admin) throw new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Bạn cần đăng nhập');
  return req.admin;
}
