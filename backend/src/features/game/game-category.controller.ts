import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { created, noContent, ok } from '@/shared/utils/response';

import type {
  CreateGameCategoryDto,
  GameCategoryIdParams,
  ListGameCategoriesQuery,
  UpdateGameCategoryDto,
} from './game-category.dto';
import type { GameCategoryService } from './game-category.service';

export class GameCategoryController {
  constructor(private readonly service: GameCategoryService) {}

  list: RequestHandler = async (req, res) => {
    const query = req.query as unknown as ListGameCategoriesQuery;
    const { items, meta } = await this.service.list(query, req.admin !== undefined);
    ok(res, items, meta);
  };

  create: RequestHandler = async (req, res) => {
    const adminId = getRequestAdmin(req).id;
    created(res, await this.service.create(adminId, req.body as CreateGameCategoryDto));
  };

  update: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as GameCategoryIdParams;
    const adminId = getRequestAdmin(req).id;
    ok(res, await this.service.update(adminId, id, req.body as UpdateGameCategoryDto));
  };

  remove: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as GameCategoryIdParams;
    await this.service.remove(getRequestAdmin(req).id, id);
    noContent(res);
  };
}
