import type { Prisma } from '@/generated/prisma/client';

/** Một quyền lợi của gói (đã xếp theo sortOrder) */
export interface PricePlanFeature {
  id: number;
  content: string;
  sortOrder: number;
}

/** Gói giá trả ra API (GET/POST/PUT /price-plans) */
export interface PricePlan {
  id: number;
  name: string;
  /** Đơn vị đồng */
  priceVnd: number;
  /** Vd "/giờ", "/4 giờ", "/đêm" */
  unit: string;
  /** Dòng phụ dưới giá */
  description: string | null;
  /** Gói nổi bật (nhãn HOT) */
  isHot: boolean;
  /** Chi nhánh áp dụng (xếp theo thứ tự hiển thị của chi nhánh); mảng rỗng = mọi chi nhánh */
  branches: { id: number; name: string }[];
  features: PricePlanFeature[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Cột được đọc; quyền lợi xếp theo sortOrder rồi id. Chi nhánh đi qua bảng nối nên cần `toPricePlan`. */
export const PRICE_PLAN_SELECT = {
  id: true,
  name: true,
  priceVnd: true,
  unit: true,
  description: true,
  isHot: true,
  branches: {
    select: { branch: { select: { id: true, name: true } } },
    orderBy: [{ branch: { sortOrder: 'asc' } }, { branchId: 'asc' }],
  },
  features: {
    select: { id: true, content: true, sortOrder: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  },
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PricePlanSelect;

/** Trường cho phép trong `?sort=` */
export const PRICE_PLAN_SORT_FIELDS = ['sortOrder', 'name', 'priceVnd', 'createdAt'] as const;

type PricePlanRow = Prisma.PricePlanGetPayload<{ select: typeof PRICE_PLAN_SELECT }>;

/** Dòng Prisma → PricePlan: bóc chi nhánh khỏi dòng bảng nối (price_plan_branch) */
export function toPricePlan({ branches, ...plan }: PricePlanRow): PricePlan {
  return { ...plan, branches: branches.map((link) => link.branch) };
}
