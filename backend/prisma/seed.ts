// Dữ liệu ban đầu. Chạy: npx prisma db seed (tự chạy sau `prisma migrate reset`).
// Mỗi hàm seed phải chạy lại nhiều lần vẫn an toàn (không tạo trùng, không ghi đè dữ liệu thật).
import { env } from '@/config/env';
import { disconnectDatabase, prisma } from '@/core/database/prisma';
import { logger } from '@/core/logger';
import { hashPassword } from '@/shared/utils/password';

import { seedShop as shopData } from './seed-data';

/** Dữ liệu mẫu dùng '' cho ô trống; DB lưu null (không lưu chuỗi rỗng) */
function emptyToNull(value: string): string | null {
  return value.trim() === '' ? null : value;
}

async function seedOwner(): Promise<void> {
  const username = env.SEED_OWNER_USERNAME;
  const password = env.SEED_OWNER_PASSWORD;
  if (!username || !password) {
    logger.warn(
      'seed.owner_skipped: thiếu SEED_OWNER_USERNAME hoặc SEED_OWNER_PASSWORD trong .env',
    );
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { username }, select: { id: true } });
  if (existing) {
    logger.info({ username }, 'seed.owner_exists');
    return;
  }

  await prisma.adminUser.create({
    data: { username, passwordHash: await hashPassword(password), role: 'owner' },
  });
  logger.info({ username }, 'seed.owner_created');
}

/** Dòng id = 1 của shop. Đã có thì giữ nguyên (chủ quán có thể đã sửa trên trang quản trị). */
async function seedShop(): Promise<void> {
  const existing = await prisma.shop.findUnique({ where: { id: 1 }, select: { id: true } });
  if (existing) {
    logger.info('seed.shop_exists');
    return;
  }

  await prisma.shop.create({
    data: {
      id: 1,
      name: shopData.name,
      tagline: emptyToNull(shopData.tagline),
      hoursLabel: emptyToNull(shopData.hoursLabel),
      hotline: emptyToNull(shopData.hotline),
      email: emptyToNull(shopData.email),
      facebookUrl: emptyToNull(shopData.facebook),
      zaloUrl: emptyToNull(shopData.zalo),
      tiktokUrl: emptyToNull(shopData.tiktok),
      instagramUrl: emptyToNull(shopData.instagram),
      youtubeUrl: emptyToNull(shopData.youtube),
    },
  });
  logger.info('seed.shop_created');
}

async function main(): Promise<void> {
  await seedOwner();
  await seedShop();
}

main()
  .catch((err: unknown) => {
    logger.error({ err }, 'seed.failed');
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
