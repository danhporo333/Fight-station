import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { ok } from '@/shared/utils/response';

import type { UpdateShopDto } from './shop.dto';
import type { ShopService } from './shop.service';

export class ShopController {
  constructor(private readonly service: ShopService) {}

  get: RequestHandler = async (_req, res) => {
    ok(res, await this.service.get());
  };

  update: RequestHandler = async (req, res) => {
    ok(res, await this.service.update(getRequestAdmin(req).id, req.body as UpdateShopDto));
  };
}
