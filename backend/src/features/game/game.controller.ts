import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { created, noContent, ok } from '@/shared/utils/response';

import type {
  CreateGameDto,
  GameIdParams,
  GetGameQuery,
  ListGamesQuery,
  UpdateGameDto,
} from './game.dto';
import type { GameService } from './game.service';

export class GameController {
  constructor(private readonly service: GameService) {}

  list: RequestHandler = async (req, res) => {
    const query = req.query as unknown as ListGamesQuery;
    const { items, meta } = await this.service.list(query, req.admin !== undefined);
    ok(res, items, meta);
  };

  get: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as GameIdParams;
    const { includeInactive } = req.query as unknown as GetGameQuery;
    ok(res, await this.service.get(id, req.admin !== undefined && includeInactive === true));
  };

  create: RequestHandler = async (req, res) => {
    created(res, await this.service.create(getRequestAdmin(req).id, req.body as CreateGameDto));
  };

  update: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as GameIdParams;
    ok(res, await this.service.update(getRequestAdmin(req).id, id, req.body as UpdateGameDto));
  };

  remove: RequestHandler = async (req, res) => {
    const { id } = req.params as unknown as GameIdParams;
    await this.service.remove(getRequestAdmin(req).id, id);
    noContent(res);
  };
}
