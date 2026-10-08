import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { env } from '@/config/env';
import { PrismaClient } from '@/generated/prisma/client';

// Prisma 7 kết nối MySQL qua driver adapter (mariadb). Tách DATABASE_URL thành config
// để ép time zone phiên là UTC (DATABASE.md). Kết nối mở lười ở query đầu tiên.
// Dịch tham số SSL trên URL (dùng cho DB cloud như TiDB Cloud, bắt buộc TLS) sang option của driver.
// Không có tham số nào thì không dùng SSL (MySQL local).
function resolveSsl(url: URL): { rejectUnauthorized: boolean } | undefined {
  const { searchParams } = url;
  const sslaccept = searchParams.get('sslaccept');
  const sslmode = searchParams.get('sslmode');
  if (!sslaccept && !sslmode && searchParams.get('ssl') !== 'true') return undefined;
  return { rejectUnauthorized: sslaccept !== 'accept_invalid_certs' && sslmode !== 'no-verify' };
}

function createAdapter(databaseUrl: string): PrismaMariaDb {
  const url = new URL(databaseUrl);
  return new PrismaMariaDb({
    ssl: resolveSsl(url),
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    timezone: 'Z',
    // Mặc định của driver chỉ 1 giây, không đủ khi function (Vercel) ở xa DB cloud
    connectTimeout: 10_000,
    connectionLimit: 10,
  });
}

export const prisma = new PrismaClient({ adapter: createAdapter(env.DATABASE_URL) });

export type Database = typeof prisma;

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
