import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { created, noContent, ok } from '@/shared/utils/response';

import type {
  CreateMenuItemDto,
  GetMenuItemQuery,
  ListMenuItemsQuery,
  MenuItemIdParams,
  UpdateMenuItemDto,
} from './menu-item.dto';
import type { MenuItemService } from './menu-item.service';

export class MenuItemController {
  constructor(private readonly service: MenuItemService) {}

  /** GET /menu: toàn bộ menu cho trang khách (không phân trang) */
  menu: RequestHandler = async (_req, res) => {
    ok(res, await this.service.getMenu());
  };

  list: RequestHandler = async (req, res) => {
    const query = req.query as unknown as ListMenuItemsQuery;
    const { items, meta } = await this.service.list(query, req.admin !== undefined);
    ok(res, items, meta);
  };

  get: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as MenuItemIdParams;
    const { includeInactive } = req.query as unknown as GetMenuItemQuery;
    ok(res, await this.service.get(id, req.admin !== undefined && includeInactive === true));
  };

  create: RequestHandler = async (req, res) => {
    created(res, await this.service.create(getRequestAdmin(req).id, req.body as CreateMenuItemDto));
  };

  update: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as MenuItemIdParams;
    ok(res, await this.service.update(getRequestAdmin(req).id, id, req.body as UpdateMenuItemDto));
  };

  remove: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as MenuItemIdParams;
    await this.service.remove(getRequestAdmin(req).id, id);
    noContent(res);
  };
}
