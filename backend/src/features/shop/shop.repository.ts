import type { Database } from '@/core/database/prisma';

import type { UpdateShopDto } from './shop.dto';
import { SHOP_ID, SHOP_SELECT, type Shop } from './shop.entity';

/** Luôn đọc và ghi theo id = 1, không nhận id từ client */
export class ShopRepository {
  constructor(private readonly db: Database) {}

  find(): Promise<Shop | null> {
    return this.db.shop.findUnique({ where: { id: SHOP_ID }, select: SHOP_SELECT });
  }

  update(data: UpdateShopDto): Promise<Shop> {
    return this.db.shop.update({ where: { id: SHOP_ID }, data, select: SHOP_SELECT });
  }
}
