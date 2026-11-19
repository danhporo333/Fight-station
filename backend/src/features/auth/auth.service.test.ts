import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAuthGuards } from '@/shared/middlewares';
import { signAccessToken, verifyAccessToken } from '@/shared/utils/jwt';
import { hashPassword, verifyPassword } from '@/shared/utils/password';

import { AuthService } from './auth.service';
import type { AuthRepository, ResetTokenRecord } from './auth.repository';

const sendMail = vi.hoisted(() => vi.fn());
vi.mock('@/core/mailer', () => ({ sendMail }));

interface FakeAdmin {
  id: number;
  username: string;
  email: string | null;
  passwordHash: string;
  tokenVersion: number;
  isActive: boolean;
}

/** Repository giả giữ dữ liệu trong bộ nhớ, đủ hành vi cho luồng quên mật khẩu */
function createFakeRepo(admin: FakeAdmin) {
  const tokens = new Map<string, ResetTokenRecord>();
  let nextId = 1;
  const repo = {
    findSessionById: async (id: number) =>
      id === admin.id
        ? { id, role: 'owner' as const, isActive: admin.isActive, tokenVersion: admin.tokenVersion }
        : null,
    findForReset: async (identifier: string) =>
      identifier === admin.username || identifier === admin.email
        ? { id: admin.id, email: admin.email, isActive: admin.isActive }
        : null,
    createResetToken: async (adminUserId: number, tokenHash: string, expiresAt: Date) => {
      tokens.clear();
      tokens.set(tokenHash, { id: nextId++, adminUserId, expiresAt, usedAt: null });
    },
    findResetToken: async (tokenHash: string) => tokens.get(tokenHash) ?? null,
    consumeResetToken: async (
      tokenId: number,
      adminUserId: number,
      passwordHash: string,
      now: Date,
    ) => {
      const record = [...tokens.values()].find((t) => t.id === tokenId);
      if (!record || record.usedAt || record.expiresAt <= now) return false;
      record.usedAt = now;
      admin.passwordHash = passwordHash;
      admin.tokenVersion += 1;
      return adminUserId === admin.id;
    },
  };
  return { repo: repo as unknown as AuthRepository, tokens };
}

function tokenFromMail(): string {
  const { text } = sendMail.mock.calls.at(-1)![0] as { text: string };
  const match = /token=([^\s]+)/.exec(text);
  return decodeURIComponent(match![1]!);
}

describe('quên mật khẩu', () => {
  let admin: FakeAdmin;
  let service: AuthService;
  let tokens: Map<string, ResetTokenRecord>;

  beforeEach(async () => {
    sendMail.mockReset();
    admin = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: await hashPassword('matkhau-cu-123'),
      tokenVersion: 0,
      isActive: true,
    };
    const fake = createFakeRepo(admin);
    tokens = fake.tokens;
    service = new AuthService(fake.repo);
  });

  it('gửi email khi tài khoản có email, tìm được theo username hoặc email', async () => {
    await service.forgotPassword({ identifier: 'admin' });
    await service.forgotPassword({ identifier: 'admin@example.com' });
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(sendMail.mock.calls[0]![0]).toMatchObject({ to: 'admin@example.com' });
  });

  it('không gửi và không báo lỗi khi tài khoản không có/không tồn tại/bị khóa', async () => {
    await expect(service.forgotPassword({ identifier: 'khong-co' })).resolves.toBeUndefined();
    admin.email = null;
    await expect(service.forgotPassword({ identifier: 'admin' })).resolves.toBeUndefined();
    admin.email = 'admin@example.com';
    admin.isActive = false;
    await service.forgotPassword({ identifier: 'admin' });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('không báo lỗi khi gửi mail thất bại', async () => {
    sendMail.mockRejectedValueOnce(new Error('smtp down'));
    await expect(service.forgotPassword({ identifier: 'admin' })).resolves.toBeUndefined();
  });

  it('chỉ lưu hash của token, không lưu token thô', async () => {
    await service.forgotPassword({ identifier: 'admin' });
    expect(tokens.has(tokenFromMail())).toBe(false);
  });

  it('đặt lại mật khẩu bằng token đúng, token dùng lại bị từ chối', async () => {
    await service.forgotPassword({ identifier: 'admin' });
    const token = tokenFromMail();

    await service.resetPassword({ token, newPassword: 'matkhau-moi-456' });
    expect(await verifyPassword(admin.passwordHash, 'matkhau-moi-456')).toBe(true);
    expect(admin.tokenVersion).toBe(1);

    await expect(service.resetPassword({ token, newPassword: 'khac-nua-789' })).rejects.toMatchObject({
      code: 'AUTH_006',
    });
  });

  it('từ chối token sai và token hết hạn', async () => {
    await expect(
      service.resetPassword({ token: 'sai-token', newPassword: 'matkhau-moi-456' }),
    ).rejects.toMatchObject({ code: 'AUTH_006' });

    await service.forgotPassword({ identifier: 'admin' });
    const token = tokenFromMail();
    for (const record of tokens.values()) record.expiresAt = new Date(Date.now() - 1000);
    await expect(service.resetPassword({ token, newPassword: 'matkhau-moi-456' })).rejects.toMatchObject({
      code: 'AUTH_006',
    });
    expect(admin.tokenVersion).toBe(0);
  });

  it('yêu cầu mới làm token cũ mất hiệu lực', async () => {
    await service.forgotPassword({ identifier: 'admin' });
    const oldToken = tokenFromMail();
    await service.forgotPassword({ identifier: 'admin' });
    await expect(
      service.resetPassword({ token: oldToken, newPassword: 'matkhau-moi-456' }),
    ).rejects.toMatchObject({ code: 'AUTH_006' });
  });

  it('JWT cấp trước khi đặt lại bị guard từ chối', async () => {
    const guards = createAuthGuards(service);
    const oldJwt = signAccessToken({ sub: admin.id, role: 'owner', tokenVersion: 0 }).accessToken;
    expect(verifyAccessToken(oldJwt).ok).toBe(true);

    await service.forgotPassword({ identifier: 'admin' });
    await service.resetPassword({ token: tokenFromMail(), newPassword: 'matkhau-moi-456' });

    const req = { get: () => `Bearer ${oldJwt}` } as never;
    const res = { setHeader: vi.fn() } as never;
    await expect(guards.requireAdmin(req, res, vi.fn())).rejects.toMatchObject({
      code: 'AUTH_002',
    });

    const newJwt = signAccessToken({ sub: admin.id, role: 'owner', tokenVersion: 1 }).accessToken;
    const next = vi.fn();
    await guards.requireAdmin({ get: () => `Bearer ${newJwt}` } as never, res, next);
    expect(next).toHaveBeenCalled();
  });
});
