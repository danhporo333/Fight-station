import { Router } from 'express';

import { publicCache, validate, type AuthGuards } from '@/shared/middlewares';

import type { MenuCategoryController } from './menu-category.controller';
import {
  createMenuCategorySchema,
  listMenuCategoriesQuerySchema,
  menuCategoryIdParamsSchema,
  updateMenuCategorySchema,
} from './menu-category.dto';

/** Gắn dưới /api/v1/menu-categories */
export function createMenuCategoryRouter(
  controller: MenuCategoryController,
  guards: AuthGuards,
): Router {
  const router = Router();

  router.get(
    '/',
    guards.optionalAdmin,
    publicCache,
    validate(listMenuCategoriesQuerySchema, 'query'),
    controller.list,
  );
  router.post('/', guards.requireAdmin, validate(createMenuCategorySchema), controller.create);
  router.put(
    '/:id',
    guards.requireAdmin,
    validate(menuCategoryIdParamsSchema, 'params'),
    validate(updateMenuCategorySchema),
    controller.update,
  );
  router.delete(
    '/:id',
    guards.requireAdmin,
    validate(menuCategoryIdParamsSchema, 'params'),
    controller.remove,
  );

  return router;
}
