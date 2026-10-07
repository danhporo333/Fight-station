import { Router } from 'express';

import { loginRateLimit, noStore, validate, type AuthGuards } from '@/shared/middlewares';

import type { AuthController } from './auth.controller';
import { changePasswordSchema, loginSchema } from './auth.dto';

/** Gắn dưới /api/v1/auth */
export function createAuthRouter(controller: AuthController, guards: AuthGuards): Router {
  const router = Router();

  router.post('/login', loginRateLimit, noStore, validate(loginSchema), controller.login);
  router.get('/me', guards.requireAdmin, controller.me);
  router.put(
    '/password',
    guards.requireAdmin,
    validate(changePasswordSchema),
    controller.changePassword,
  );

  return router;
}
