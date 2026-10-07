import { Router } from 'express';

import { publicCache, validate, type AuthGuards } from '@/shared/middlewares';

import type { BranchController } from './branch.controller';
import {
  branchIdParamsSchema,
  createBranchSchema,
  getBranchQuerySchema,
  listBranchesQuerySchema,
  updateBranchSchema,
} from './branch.dto';

/** Gắn dưới /api/v1/branches */
export function createBranchRouter(controller: BranchController, guards: AuthGuards): Router {
  const router = Router();

  // Công khai; có token admin thì includeInactive=true mới có hiệu lực
  router.get(
    '/',
    guards.optionalAdmin,
    publicCache,
    validate(listBranchesQuerySchema, 'query'),
    controller.list,
  );
  router.get(
    '/:id',
    guards.optionalAdmin,
    publicCache,
    validate(branchIdParamsSchema, 'params'),
    validate(getBranchQuerySchema, 'query'),
    controller.get,
  );

  router.post('/', guards.requireOwner, validate(createBranchSchema), controller.create);
  router.put(
    '/:id',
    guards.requireOwner,
    validate(branchIdParamsSchema, 'params'),
    validate(updateBranchSchema),
    controller.update,
  );
  router.delete(
    '/:id',
    guards.requireOwner,
    validate(branchIdParamsSchema, 'params'),
    controller.remove,
  );

  return router;
}
