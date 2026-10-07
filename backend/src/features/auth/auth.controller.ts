import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { ok } from '@/shared/utils/response';

import type { ChangePasswordDto, LoginDto } from './auth.dto';
import type { AuthService } from './auth.service';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  login: RequestHandler = async (req, res) => {
    ok(res, await this.service.login(req.body as LoginDto));
  };

  me: RequestHandler = async (req, res) => {
    ok(res, await this.service.getMe(getRequestAdmin(req).id));
  };

  changePassword: RequestHandler = async (req, res) => {
    await this.service.changePassword(getRequestAdmin(req).id, req.body as ChangePasswordDto);
    ok(res, null);
  };
}
