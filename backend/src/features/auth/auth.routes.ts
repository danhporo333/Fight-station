import { Router } from 'express';

import {
  loginRateLimit,
  noStore,
  passwordResetRateLimit,
  validate,
  type AuthGuards,
} from '@/shared/middlewares';

import type { AuthController } from './auth.controller';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updateEmailSchema,
} from './auth.dto';

/** Gắn dưới /api/v1/auth */
export function createAuthRouter(controller: AuthController, guards: AuthGuards): Router {
  const router = Router();

  router.post('/login', loginRateLimit, noStore, validate(loginSchema), controller.login);
  router.post(
    '/forgot-password',
    passwordResetRateLimit,
    noStore,
    validate(forgotPasswordSchema),
    controller.forgotPassword,
  );
  router.post(
    '/reset-password',
    passwordResetRateLimit,
    noStore,
    validate(resetPasswordSchema),
    controller.resetPassword,
  );
  router.get('/me', guards.requireAdmin, controller.me);
  router.put(
    '/password',
    guards.requireAdmin,
    validate(changePasswordSchema),
    controller.changePassword,
  );
  router.put('/email', guards.requireAdmin, validate(updateEmailSchema), controller.updateEmail);

  return router;
}
