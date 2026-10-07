import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Giá trị giả cho config/env.ts; test không bao giờ chạm database dev/production
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'mysql://test:test@localhost:3306/fight_station_test',
      JWT_SECRET: 'test-secret-test-secret-test-secret-1234',
      LOG_LEVEL: 'silent',
    },
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**', 'src/**/*.test.ts', 'src/server.ts'],
    },
  },
});
