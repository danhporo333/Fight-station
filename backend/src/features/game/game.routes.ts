import { Router } from 'express';

import { publicCache, validate, type AuthGuards } from '@/shared/middlewares';

import type { GameController } from './game.controller';
import {
  createGameSchema,
  gameIdParamsSchema,
  getGameQuerySchema,
  listGamesQuerySchema,
  updateGameSchema,
} from './game.dto';

/** Gắn dưới /api/v1/games. Đọc công khai; ghi cần Admin (owner hoặc staff). */
export function createGameRouter(controller: GameController, guards: AuthGuards): Router {
  const router = Router();

  router.get(
    '/',
    guards.optionalAdmin,
    publicCache,
    validate(listGamesQuerySchema, 'query'),
    controller.list,
  );
  router.get(
    '/:id',
    guards.optionalAdmin,
    publicCache,
    validate(gameIdParamsSchema, 'params'),
    validate(getGameQuerySchema, 'query'),
    controller.get,
  );

  router.post('/', guards.requireAdmin, validate(createGameSchema), controller.create);
  router.put(
    '/:id',
    guards.requireAdmin,
    validate(gameIdParamsSchema, 'params'),
    validate(updateGameSchema),
    controller.update,
  );
  router.delete(
    '/:id',
    guards.requireAdmin,
    validate(gameIdParamsSchema, 'params'),
    controller.remove,
  );

  return router;
}
