/** Thông tin quán trả ra API (GET/PUT /shop) */
export interface Shop {
  id: number;
  name: string;
  tagline: string | null;
  hoursLabel: string | null;
  hotline: string | null;
  email: string | null;
  facebookUrl: string | null;
  zaloUrl: string | null;
  tiktokUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  updatedAt: Date;
}

/** Quán chỉ có một dòng (CHECK (id = 1) trong migration) */
export const SHOP_ID = 1;

/** Các cột được phép đọc ra; dùng làm `select` của Prisma */
export const SHOP_SELECT = {
  id: true,
  name: true,
  tagline: true,
  hoursLabel: true,
  hotline: true,
  email: true,
  facebookUrl: true,
  zaloUrl: true,
  tiktokUrl: true,
  instagramUrl: true,
  youtubeUrl: true,
  updatedAt: true,
} as const;
