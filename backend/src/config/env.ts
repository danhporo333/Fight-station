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
  SEED_OWNER_EMAIL: z.string().trim().email().max(255).optional(),

  // Gửi email đặt lại mật khẩu. Thiếu SMTP_HOST thì không gửi, chỉ ghi link ra log (dùng khi dev).
  SMTP_HOST: z.string().trim().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().trim().min(1).default('Fight Station <no-reply@localhost>'),
  // Địa chỉ web quản trị, dùng dựng link trong email
  FRONTEND_URL: z.string().trim().url().default('http://localhost:5173'),
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(1440).default(30),
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
