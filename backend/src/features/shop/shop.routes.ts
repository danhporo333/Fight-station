import { Router } from 'express';

import { publicCache, validate, type AuthGuards } from '@/shared/middlewares';

import type { ShopController } from './shop.controller';
import { updateShopSchema } from './shop.dto';

/** Gắn dưới /api/v1/shop */
export function createShopRouter(controller: ShopController, guards: AuthGuards): Router {
  const router = Router();

  router.get('/', publicCache, controller.get);
  router.put('/', guards.requireOwner, validate(updateShopSchema), controller.update);

  return router;
}
