import { logger } from '@/core/logger';
import { ErrorCode, NotFoundError } from '@/shared/errors';

import type { UpdateShopDto } from './shop.dto';
import type { Shop } from './shop.entity';
import type { ShopRepository } from './shop.repository';

export class ShopService {
  constructor(private readonly repo: ShopRepository) {}

  async get(): Promise<Shop> {
    const shop = await this.repo.find();
    if (!shop) throw shopNotFound();
    return shop;
  }

  async update(adminId: number, dto: UpdateShopDto): Promise<Shop> {
    // Kiểm tra trước để trả SHOP_001 thay vì lỗi Prisma P2025 khi chưa seed
    await this.get();
    const shop = await this.repo.update(dto);
    logger.info({ adminId, fields: Object.keys(dto) }, 'shop.updated');
    return shop;
  }
}

function shopNotFound(): NotFoundError {
  return new NotFoundError(
    ErrorCode.SHOP_NOT_FOUND,
    'Chưa có thông tin quán, hãy chạy npx prisma db seed',
  );
}
