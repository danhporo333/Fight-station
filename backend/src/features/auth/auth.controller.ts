import type { RequestHandler } from 'express';

import { getRequestAdmin } from '@/shared/middlewares';
import { ok } from '@/shared/utils/response';

import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  UpdateEmailDto,
} from './auth.dto';
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
    const { id, role } = getRequestAdmin(req);
    ok(res, await this.service.changePassword(id, role, req.body as ChangePasswordDto));
  };

  updateEmail: RequestHandler = async (req, res) => {
    ok(res, await this.service.updateEmail(getRequestAdmin(req).id, req.body as UpdateEmailDto));
  };

  forgotPassword: RequestHandler = async (req, res) => {
    await this.service.forgotPassword(req.body as ForgotPasswordDto);
    ok(res, null);
  };

  resetPassword: RequestHandler = async (req, res) => {
    await this.service.resetPassword(req.body as ResetPasswordDto);
    ok(res, null);
  };
}
