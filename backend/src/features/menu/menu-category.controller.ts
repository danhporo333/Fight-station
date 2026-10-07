import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { created, noContent, ok } from '@/shared/utils/response';

import type {
  CreateMenuCategoryDto,
  ListMenuCategoriesQuery,
  MenuCategoryIdParams,
  UpdateMenuCategoryDto,
} from './menu-category.dto';
import type { MenuCategoryService } from './menu-category.service';

export class MenuCategoryController {
  constructor(private readonly service: MenuCategoryService) {}

  list: RequestHandler = async (req, res) => {
    const query = req.query as unknown as ListMenuCategoriesQuery;
    const { items, meta } = await this.service.list(query, req.admin !== undefined);
    ok(res, items, meta);
  };

  create: RequestHandler = async (req, res) => {
    const adminId = getRequestAdmin(req).id;
    created(res, await this.service.create(adminId, req.body as CreateMenuCategoryDto));
  };

  update: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as MenuCategoryIdParams;
    const adminId = getRequestAdmin(req).id;
    ok(res, await this.service.update(adminId, id, req.body as UpdateMenuCategoryDto));
  };

  remove: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as MenuCategoryIdParams;
    await this.service.remove(getRequestAdmin(req).id, id);
    noContent(res);
  };
}
