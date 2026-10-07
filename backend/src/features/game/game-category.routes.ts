import { Router } from 'express';

import { publicCache, validate, type AuthGuards } from '@/shared/middlewares';

import type { GameCategoryController } from './game-category.controller';
import {
  createGameCategorySchema,
  gameCategoryIdParamsSchema,
  listGameCategoriesQuerySchema,
  updateGameCategorySchema,
} from './game-category.dto';

/** Gắn dưới /api/v1/game-categories */
export function createGameCategoryRouter(
  controller: GameCategoryController,
  guards: AuthGuards,
): Router {
  const router = Router();

  router.get(
    '/',
    guards.optionalAdmin,
    publicCache,
    validate(listGameCategoriesQuerySchema, 'query'),
    controller.list,
  );
  router.post('/', guards.requireAdmin, validate(createGameCategorySchema), controller.create);
  router.put(
    '/:id',
    guards.requireAdmin,
    validate(gameCategoryIdParamsSchema, 'params'),
    validate(updateGameCategorySchema),
    controller.update,
  );
  router.delete(
    '/:id',
    guards.requireAdmin,
    validate(gameCategoryIdParamsSchema, 'params'),
    controller.remove,
  );

  return router;
}
