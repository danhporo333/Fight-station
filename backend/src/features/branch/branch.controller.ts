import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { created, noContent, ok } from '@/shared/utils/response';

import type {
  BranchIdParams,
  CreateBranchDto,
  GetBranchQuery,
  ListBranchesQuery,
  UpdateBranchDto,
} from './branch.dto';
import type { BranchService } from './branch.service';

export class BranchController {
  constructor(private readonly service: BranchService) {}

  list: RequestHandler = async (req, res) => {
    const query = req.query as unknown as ListBranchesQuery;
    const { items, meta } = await this.service.list(query, req.admin !== undefined);
    ok(res, items, meta);
  };

  get: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as BranchIdParams;
    const { includeInactive } = req.query as unknown as GetBranchQuery;
    ok(res, await this.service.get(id, req.admin !== undefined && includeInactive === true));
  };

  create: RequestHandler = async (req, res) => {
    created(res, await this.service.create(getRequestAdmin(req).id, req.body as CreateBranchDto));
  };

  update: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as BranchIdParams;
    ok(res, await this.service.update(getRequestAdmin(req).id, id, req.body as UpdateBranchDto));
  };

  remove: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as BranchIdParams;
    await this.service.remove(getRequestAdmin(req).id, id);
    noContent(res);
  };
}
