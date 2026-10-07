import { Router } from 'express';

import { publicCache, validate, type AuthGuards } from '@/shared/middlewares';

import type { MenuItemController } from './menu-item.controller';
import {
  createMenuItemSchema,
  getMenuItemQuerySchema,
  listMenuItemsQuerySchema,
  menuItemIdParamsSchema,
  updateMenuItemSchema,
} from './menu-item.dto';

/** Gắn dưới /api/v1/menu-items. Đọc công khai; ghi cần Admin (owner hoặc staff). */
export function createMenuItemRouter(controller: MenuItemController, guards: AuthGuards): Router {
  const router = Router();

  router.get(
    '/',
    guards.optionalAdmin,
    publicCache,
    validate(listMenuItemsQuerySchema, 'query'),
    controller.list,
  );
  router.get(
    '/:id',
    guards.optionalAdmin,
    publicCache,
    validate(menuItemIdParamsSchema, 'params'),
    validate(getMenuItemQuerySchema, 'query'),
    controller.get,
  );

  router.post('/', guards.requireAdmin, validate(createMenuItemSchema), controller.create);
  router.put(
    '/:id',
    guards.requireAdmin,
    validate(menuItemIdParamsSchema, 'params'),
    validate(updateMenuItemSchema),
    controller.update,
  );
  router.delete(
    '/:id',
    guards.requireAdmin,
    validate(menuItemIdParamsSchema, 'params'),
    controller.remove,
  );

  return router;
}

/** Gắn dưới /api/v1/menu: toàn bộ menu cho trang khách (công khai, không cần guard) */
export function createMenuRouter(controller: MenuItemController): Router {
  const router = Router();
  router.get('/', publicCache, controller.menu);
  return router;
}
