import { defineConfig, env } from 'prisma/config';

// Prisma 7 không tự đọc .env; Node 24 có sẵn loadEnvFile (bỏ qua nếu không có file, vd trên CI)
try {
  process.loadEnvFile();
} catch {
  // dùng biến môi trường của hệ thống
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url: env('DATABASE_URL') },
});
