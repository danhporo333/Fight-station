import type { Database } from '@/core/database/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { parseSort, toSkipTake } from '@/shared/utils/pagination';

import type { CreatePricePlanDto, UpdatePricePlanDto } from './price-plan.dto';
import {
  PRICE_PLAN_SELECT,
  PRICE_PLAN_SORT_FIELDS,
  toPricePlan,
  type PricePlan,
} from './price-plan.entity';
import type { BranchIdsChange, PricePlanFilter } from './price-plan.types';

type PlanData = Omit<CreatePricePlanDto, 'features' | 'branchIds'>;
type PlanUpdateData = Omit<UpdatePricePlanDto, 'features' | 'branchIds'>;

/** Chuỗi quyền lợi → dòng price_plan_feature: vị trí trong mảng là sortOrder */
function toFeatureRows(features: string[]) {
  return features.map((content, sortOrder) => ({ content, sortOrder }));
}

export class PricePlanRepository {
  constructor(private readonly db: Database) {}

  async findMany(filter: PricePlanFilter): Promise<{ items: PricePlan[]; total: number }> {
    const where: Prisma.PricePlanWhereInput = {
      ...(filter.includeInactive ? {} : { isActive: true }),
      // Chi nhánh X thấy gói áp dụng mọi chi nhánh (không có dòng nối) và gói có dòng của X
      ...(filter.branchId
        ? {
            OR: [{ branches: { none: {} } }, { branches: { some: { branchId: filter.branchId } } }],
          }
        : {}),
    };
    const [rows, total] = await this.db.$transaction([
      this.db.pricePlan.findMany({
        where,
        select: PRICE_PLAN_SELECT,
        orderBy: [...parseSort(filter.sort, PRICE_PLAN_SORT_FIELDS), { id: 'asc' }],
        ...toSkipTake(filter),
      }),
      this.db.pricePlan.count({ where }),
    ]);
    return { items: rows.map(toPricePlan), total };
  }

  async findById(id: number, includeInactive: boolean): Promise<PricePlan | null> {
    const row = await this.db.pricePlan.findFirst({
      where: { id, ...(includeInactive ? {} : { isActive: true }) },
      select: PRICE_PLAN_SELECT,
    });
    return row && toPricePlan(row);
  }

  /** Tạo gói kèm quyền lợi và chi nhánh (nested create, một câu lệnh). `branchIds` null = mọi chi nhánh. */
  async create(data: PlanData, features: string[], branchIds: number[] | null): Promise<PricePlan> {
    const row = await this.db.pricePlan.create({
      data: {
        ...data,
        features: { create: toFeatureRows(features) },
        ...(branchIds ? { branches: { create: branchIds.map((branchId) => ({ branchId })) } } : {}),
      },
      select: PRICE_PLAN_SELECT,
    });
    return toPricePlan(row);
  }

  /**
   * Sửa gói; có gửi `features` / `branchIds` thì xóa hết dòng cũ rồi tạo lại theo giá trị mới, trong
   * cùng transaction (không bao giờ có lúc gói mất hết quyền lợi, hay vô tình thành "mọi chi nhánh").
   */
  async update(
    id: number,
    data: PlanUpdateData,
    features: string[] | undefined,
    branchIds: BranchIdsChange,
  ): Promise<PricePlan> {
    const row = await this.db.$transaction(async (tx) => {
      if (features) {
        await tx.pricePlanFeature.deleteMany({ where: { pricePlanId: id } });
        await tx.pricePlanFeature.createMany({
          data: toFeatureRows(features).map((feature) => ({ ...feature, pricePlanId: id })),
        });
      }
      if (branchIds !== undefined) {
        await tx.pricePlanBranch.deleteMany({ where: { pricePlanId: id } });
        if (branchIds) {
          await tx.pricePlanBranch.createMany({
            data: branchIds.map((branchId) => ({ branchId, pricePlanId: id })),
          });
        }
      }
      return tx.pricePlan.update({ where: { id }, data, select: PRICE_PLAN_SELECT });
    });
    return toPricePlan(row);
  }

  /** Xóa thật; quyền lợi và dòng nối chi nhánh tự xóa theo (CASCADE) */
  async delete(id: number): Promise<void> {
    await this.db.pricePlan.delete({ where: { id } });
  }
}
