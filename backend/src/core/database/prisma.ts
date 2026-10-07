import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { env } from '@/config/env';
import { PrismaClient } from '@/generated/prisma/client';

// Prisma 7 kết nối MySQL qua driver adapter (mariadb). Tách DATABASE_URL thành config
// để ép time zone phiên là UTC (DATABASE.md). Kết nối mở lười ở query đầu tiên.
function createAdapter(databaseUrl: string): PrismaMariaDb {
  const url = new URL(databaseUrl);
  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    timezone: 'Z',
    connectionLimit: 10,
  });
}

export const prisma = new PrismaClient({ adapter: createAdapter(env.DATABASE_URL) });

export type Database = typeof prisma;

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
