import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app';

describe('createApp', () => {
  const app = createApp();

  describe('GET /health', () => {
    it('trả 200 { status: ok } kèm X-Request-Id', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
      expect(res.headers['x-request-id']).toBeTruthy();
    });
  });

  describe('route không tồn tại', () => {
    it('trả 404 COMMON_003', async () => {
      const res = await request(app).get('/api/v1/khong-co');

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, error: { code: 'COMMON_003' } });
    });
  });

  describe('JSON sai cú pháp', () => {
    it('trả 400 COMMON_002', async () => {
      const res = await request(app)
        .post('/api/v1/games')
        .set('Content-Type', 'application/json')
        .send('{"title":');

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, error: { code: 'COMMON_002' } });
    });
  });
});
