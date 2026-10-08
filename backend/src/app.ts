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
import {
  createGameCategoryRouter,
  createGameRouter,
  GameCategoryController,
  GameCategoryRepository,
  GameCategoryService,
  GameController,
  GameRepository,
  GameService,
} from '@/features/game';
import {
  createMenuCategoryRouter,
  createMenuItemRouter,
  createMenuRouter,
  MenuCategoryController,
  MenuCategoryRepository,
  MenuCategoryService,
  MenuItemController,
  MenuItemRepository,
  MenuItemService,
} from '@/features/menu';
import {
  createPricePlanRouter,
  PricePlanController,
  PricePlanRepository,
  PricePlanService,
} from '@/features/price-plan';
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

  // branch: branchService truyền vào GameService (thỏa BranchLookup)
  const branchService = new BranchService(new BranchRepository(db));
  const branchController = new BranchController(branchService);

  // game: GameService hỏi chi nhánh qua BranchLookup, không import nội bộ của branch
  const gameController = new GameController(new GameService(new GameRepository(db), branchService));
  const gameCategoryController = new GameCategoryController(
    new GameCategoryService(new GameCategoryRepository(db)),
  );

  const pricePlanController = new PricePlanController(
    new PricePlanService(new PricePlanRepository(db), branchService),
  );

  // menu: một controller món phục vụ cả /menu (toàn bộ menu) và /menu-items
  const menuItemController = new MenuItemController(
    new MenuItemService(new MenuItemRepository(db)),
  );
  const menuCategoryController = new MenuCategoryController(
    new MenuCategoryService(new MenuCategoryRepository(db)),
  );

  const app = express();
  app.disable('x-powered-by');
  // Sau proxy của Vercel: lấy đúng IP khách cho rate limit
  app.set('trust proxy', 1);

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
  v1.use('/games', createGameRouter(gameController, guards));
  v1.use('/game-categories', createGameCategoryRouter(gameCategoryController, guards));
  v1.use('/price-plans', createPricePlanRouter(pricePlanController, guards));
  v1.use('/menu', createMenuRouter(menuItemController));
  v1.use('/menu-items', createMenuItemRouter(menuItemController, guards));
  v1.use('/menu-categories', createMenuCategoryRouter(menuCategoryController, guards));
  app.use(config.api.prefix, apiRateLimit, v1);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
