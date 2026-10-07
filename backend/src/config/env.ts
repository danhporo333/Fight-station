import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET phải dài ít nhất 32 ký tự'),
  JWT_EXPIRES_IN: z.string().min(1).default('1d'),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  // Chỉ prisma/seed.ts dùng: tạo tài khoản owner đầu tiên. Không bắt buộc khi chạy app.
  SEED_OWNER_USERNAME: z.string().trim().min(1).max(50).optional(),
  SEED_OWNER_PASSWORD: z.string().min(8, 'SEED_OWNER_PASSWORD phải dài ít nhất 8 ký tự').optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  // Nơi DUY NHẤT đọc process.env
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Logger chưa khởi tạo được (cần env), nên ghi thẳng ra stderr rồi dừng app
    process.stderr.write(`Biến môi trường không hợp lệ:\n${z.prettifyError(result.error)}\n`);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
