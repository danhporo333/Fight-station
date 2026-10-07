/** Chi nhánh trả ra API (GET/POST/PUT /branches) */
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  openHours: string | null;
  ps5Count: number;
  vipRoomCount: number;
  pcRoomCount: number;
  areaM2: number | null;
  mapUrl: string | null;
  facebookUrl: string | null;
  zaloUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Các cột được phép đọc ra; dùng làm `select` của Prisma */
export const BRANCH_SELECT = {
  id: true,
  name: true,
  address: true,
  phone: true,
  openHours: true,
  ps5Count: true,
  vipRoomCount: true,
  pcRoomCount: true,
  areaM2: true,
  mapUrl: true,
  facebookUrl: true,
  zaloUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Trường cho phép trong `?sort=` */
export const BRANCH_SORT_FIELDS = ['sortOrder', 'name', 'ps5Count', 'createdAt'] as const;
