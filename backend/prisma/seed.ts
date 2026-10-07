// Dữ liệu ban đầu. Chạy: npx prisma db seed (tự chạy sau `prisma migrate reset`).
// Mỗi hàm seed phải chạy lại nhiều lần vẫn an toàn (không tạo trùng, không ghi đè dữ liệu thật).
import { env } from '@/config/env';
import { disconnectDatabase, prisma } from '@/core/database/prisma';
import { logger } from '@/core/logger';
import { hashPassword } from '@/shared/utils/password';

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

async function main(): Promise<void> {
  await seedOwner();
}

main()
  .catch((err: unknown) => {
    logger.error({ err }, 'seed.failed');
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
