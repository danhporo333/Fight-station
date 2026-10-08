import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { created, noContent, ok } from '@/shared/utils/response';

import type {
  CreatePricePlanDto,
  GetPricePlanQuery,
  ListPricePlansQuery,
  PricePlanIdParams,
  UpdatePricePlanDto,
} from './price-plan.dto';
import type { PricePlanService } from './price-plan.service';

export class PricePlanController {
  constructor(private readonly service: PricePlanService) {}

  list: RequestHandler = async (req, res) => {
    const query = req.query as unknown as ListPricePlansQuery;
    const { items, meta } = await this.service.list(query, req.admin !== undefined);
    ok(res, items, meta);
  };

  get: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as PricePlanIdParams;
    const { includeInactive } = req.query as unknown as GetPricePlanQuery;
    ok(res, await this.service.get(id, req.admin !== undefined && includeInactive === true));
  };

  create: RequestHandler = async (req, res) => {
    created(
      res,
      await this.service.create(getRequestAdmin(req).id, req.body as CreatePricePlanDto),
    );
  };

  update: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as PricePlanIdParams;
    ok(res, await this.service.update(getRequestAdmin(req).id, id, req.body as UpdatePricePlanDto));
  };

  remove: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as PricePlanIdParams;
    await this.service.remove(getRequestAdmin(req).id, id);
    noContent(res);
  };
}
