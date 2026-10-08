import { Router } from 'express';

import { publicCache, validate, type AuthGuards } from '@/shared/middlewares';

import type { PricePlanController } from './price-plan.controller';
import {
  createPricePlanSchema,
  getPricePlanQuerySchema,
  listPricePlansQuerySchema,
  pricePlanIdParamsSchema,
  updatePricePlanSchema,
} from './price-plan.dto';

/** Gắn dưới /api/v1/price-plans. Đọc công khai; ghi chỉ Owner (nhân viên không sửa giá). */
export function createPricePlanRouter(controller: PricePlanController, guards: AuthGuards): Router {
  const router = Router();

  // Công khai; có token admin thì includeInactive=true mới có hiệu lực
  router.get(
    '/',
    guards.optionalAdmin,
    publicCache,
    validate(listPricePlansQuerySchema, 'query'),
    controller.list,
  );
  router.get(
    '/:id',
    guards.optionalAdmin,
    publicCache,
    validate(pricePlanIdParamsSchema, 'params'),
    validate(getPricePlanQuerySchema, 'query'),
    controller.get,
  );

  router.post('/', guards.requireOwner, validate(createPricePlanSchema), controller.create);
  router.put(
    '/:id',
    guards.requireOwner,
    validate(pricePlanIdParamsSchema, 'params'),
    validate(updatePricePlanSchema),
    controller.update,
  );
  router.delete(
    '/:id',
    guards.requireOwner,
    validate(pricePlanIdParamsSchema, 'params'),
    controller.remove,
  );

  return router;
}
