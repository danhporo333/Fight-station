import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { config } from '@/config';
import { prisma, type Database } from '@/core/database/prisma';
import { AuthController, AuthRepository, AuthService, createAuthRouter } from '@/features/auth';
import {
  BranchController,
  BranchRepository,
  BranchService,
  createBranchRouter,
} from '@/features/branch';
import { createShopRouter, ShopController, ShopRepository, ShopService } from '@/features/shop';
import {
  apiRateLimit,
  createAuthGuards,
  errorHandler,
  notFound,
  requestId,
  requestLogger,
} from '@/shared/middlewares';

/**
 * Composition root: nối dây repository → service → controller của từng feature rồi gắn route.
 * Tách khỏi server.ts để Supertest import app mà không mở cổng. Test có thể truyền `db` giả.
 */
export function createApp(db: Database = prisma): Express {
  // auth: AuthService thỏa AdminLookup → guards dùng chung cho mọi route quản trị
  const authService = new AuthService(new AuthRepository(db));
  const guards = createAuthGuards(authService);
  const authController = new AuthController(authService);

  const shopController = new ShopController(new ShopService(new ShopRepository(db)));

  // branch: branchService sau này truyền vào GameService (thỏa BranchLookup)
  const branchService = new BranchService(new BranchRepository(db));
  const branchController = new BranchController(branchService);

  const app = express();
  app.disable('x-powered-by');

  app.use(requestId);
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors(config.cors));
  app.use(express.json({ limit: config.api.bodyLimit }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Route feature gắn dưới /api/v1; feature cần quyền nhận `guards` qua router factory
  const v1 = express.Router();
  v1.use('/auth', createAuthRouter(authController, guards));
  v1.use('/shop', createShopRouter(shopController, guards));
  v1.use('/branches', createBranchRouter(branchController, guards));
  app.use(config.api.prefix, apiRateLimit, v1);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
