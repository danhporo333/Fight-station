// Dữ liệu ban đầu. Chạy: npx prisma db seed (tự chạy sau `prisma migrate reset`).
// Mỗi hàm seed phải chạy lại nhiều lần vẫn an toàn (không tạo trùng, không ghi đè dữ liệu thật).
import { env } from '@/config/env';
import { disconnectDatabase, prisma } from '@/core/database/prisma';
import { logger } from '@/core/logger';
import { hashPassword } from '@/shared/utils/password';

import {
  seedBranches as branchData,
  seedGameCategories as gameCategoryData,
  seedGames as gameData,
  seedMenu as menuData,
  seedPricePlans as pricePlanData,
  seedShop as shopData,
} from './seed-data';

/** Dữ liệu mẫu dùng '' cho ô trống; DB lưu null (không lưu chuỗi rỗng) */
function emptyToNull(value: string): string | null {
  return value.trim() === '' ? null : value;
}

async function seedOwner(): Promise<void> {
  const username = env.SEED_OWNER_USERNAME;
  const password = env.SEED_OWNER_PASSWORD;
  if (!username || !password) {
    logger.warn(
      'seed.owner_skipped: thiếu SEED_OWNER_USERNAME hoặc SEED_OWNER_PASSWORD trong .env',
    );
    return;
  }

  // Đã có bất kỳ owner nào thì thôi, KHÔNG tìm theo tên: chủ quán đổi tên đăng nhập (vd owner → admin)
  // mà seed tìm theo tên sẽ tạo thêm một owner mới dùng mật khẩu trong .env (đã xảy ra 2026-10-07).
  const existing = await prisma.adminUser.findFirst({
    where: { role: 'owner' },
    select: { id: true },
  });
  if (existing) {
    logger.info('seed.owner_exists');
    return;
  }

  await prisma.adminUser.create({
    data: { username, passwordHash: await hashPassword(password), role: 'owner' },
  });
  logger.info({ username }, 'seed.owner_created');
}

/** Dòng id = 1 của shop. Đã có thì giữ nguyên (chủ quán có thể đã sửa trên trang quản trị). */
async function seedShop(): Promise<void> {
  const existing = await prisma.shop.findUnique({ where: { id: 1 }, select: { id: true } });
  if (existing) {
    logger.info('seed.shop_exists');
    return;
  }

  await prisma.shop.create({
    data: {
      id: 1,
      name: shopData.name,
      tagline: emptyToNull(shopData.tagline),
      hoursLabel: emptyToNull(shopData.hoursLabel),
      hotline: emptyToNull(shopData.hotline),
      email: emptyToNull(shopData.email),
      facebookUrl: emptyToNull(shopData.facebook),
      zaloUrl: emptyToNull(shopData.zalo),
      tiktokUrl: emptyToNull(shopData.tiktok),
      instagramUrl: emptyToNull(shopData.instagram),
      youtubeUrl: emptyToNull(shopData.youtube),
    },
  });
  logger.info('seed.shop_created');
}

/** Chi nhánh mẫu. Bảng không có cột UNIQUE nên chỉ seed khi bảng đang trống. */
async function seedBranches(): Promise<void> {
  if ((await prisma.branch.count()) > 0) {
    logger.info('seed.branches_exist');
    return;
  }

  await prisma.branch.createMany({
    data: branchData.map((branch, index) => ({
      name: branch.name,
      address: branch.address,
      phone: emptyToNull(branch.phone),
      openHours: emptyToNull(branch.hours),
      ps5Count: branch.ps5,
      vipRoomCount: branch.vip,
      pcRoomCount: branch.pcRoom ?? 0,
      areaM2: branch.area,
      mapUrl: emptyToNull(branch.mapUrl),
      facebookUrl: emptyToNull(branch.facebook),
      zaloUrl: emptyToNull(branch.zalo),
      sortOrder: index,
    })),
  });
  logger.info({ count: branchData.length }, 'seed.branches_created');
}

/**
 * Thể loại rồi game mẫu, CHỈ khi bảng game đang trống (DB mới hoặc vừa reset). Không upsert theo tên
 * khi đã có dữ liệu: game chủ quán đã xóa hoặc đổi tên sẽ bị seed tạo lại. Thể loại upsert theo tên
 * (không trùng). Game mẫu không ghi branch_game nào (= có ở mọi chi nhánh).
 */
async function seedGames(): Promise<void> {
  if ((await prisma.game.count()) > 0) {
    logger.info('seed.games_exist');
    return;
  }

  const categoryIds = new Map<string, number>();
  for (const [index, category] of gameCategoryData.entries()) {
    const row = await prisma.gameCategory.upsert({
      where: { name: category.label },
      update: {},
      create: { name: category.label, sortOrder: index },
      select: { id: true },
    });
    categoryIds.set(category.id, row.id);
  }

  for (const [index, game] of gameData.entries()) {
    const gameCategoryId = categoryIds.get(game.category);
    if (gameCategoryId === undefined) {
      logger.warn({ title: game.name, category: game.category }, 'seed.game_category_missing');
      continue;
    }
    await prisma.game.create({
      data: {
        title: game.name,
        categories: { create: [{ gameCategoryId }] },
        players: emptyToNull(game.players),
        posterUrl: emptyToNull(game.image),
        accentColor: game.color,
        sortOrder: index,
      },
    });
  }
  logger.info(
    { categories: gameCategoryData.length, games: gameData.length },
    'seed.games_created',
  );
}

/**
 * Nhóm menu rồi món mẫu, CHỈ khi bảng menu_item đang trống (cùng lý do với seedGames).
 * Nhóm upsert theo tên; món tạo bằng createMany, thứ tự trong mảng là sortOrder. Dữ liệu là menu thật
 * của quán (seed-data.ts), không phải mẫu prototype.
 */
async function seedMenu(): Promise<void> {
  if ((await prisma.menuItem.count()) > 0) {
    logger.info('seed.menu_exists');
    return;
  }

  let itemCount = 0;
  for (const [index, category] of menuData.entries()) {
    const { id: menuCategoryId } = await prisma.menuCategory.upsert({
      where: { name: category.label },
      update: {},
      create: { name: category.label, sortOrder: index },
      select: { id: true },
    });
    const { count } = await prisma.menuItem.createMany({
      data: category.items.map((item, itemIndex) => ({
        menuCategoryId,
        name: item.name,
        description: emptyToNull(item.desc),
        priceVnd: item.price,
        isBestSeller: item.bestSeller ?? false,
        sortOrder: itemIndex,
      })),
    });
    itemCount += count;
  }
  logger.info({ categories: menuData.length, items: itemCount }, 'seed.menu_created');
}

/**
 * Bảng giá thật của quán, CHỈ khi bảng price_plan đang trống (bảng không có cột UNIQUE). Bảng giá này
 * là của chi nhánh thứ 4 (theo thứ tự hiển thị), nên gắn `branchId` của chi nhánh đó; chưa có đủ 4 chi
 * nhánh thì không gắn chi nhánh nào (áp dụng mọi chi nhánh). `period` → `description`, `hot` → `isHot`; quyền lợi tạo
 * cùng gói bằng nested create.
 */
async function seedPricePlans(): Promise<void> {
  if ((await prisma.pricePlan.count()) > 0) {
    logger.info('seed.price_plans_exist');
    return;
  }

  const branches = await prisma.branch.findMany({
    select: { id: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  const branchId = branches[3]?.id ?? null;

  for (const [index, plan] of pricePlanData.entries()) {
    await prisma.pricePlan.create({
      data: {
        name: plan.name,
        priceVnd: plan.price,
        unit: plan.unit,
        description: emptyToNull(plan.period),
        isHot: plan.hot,
        sortOrder: index,
        ...(branchId === null ? {} : { branches: { create: [{ branchId }] } }),
        features: {
          create: plan.features.map((content, sortOrder) => ({ content, sortOrder })),
        },
      },
    });
  }
  logger.info({ count: pricePlanData.length, branchId }, 'seed.price_plans_created');
}

async function main(): Promise<void> {
  await seedOwner();
  await seedShop();
  await seedBranches();
  await seedGames();
  await seedPricePlans();
  await seedMenu();
}

main()
  .catch((err: unknown) => {
    logger.error({ err }, 'seed.failed');
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
