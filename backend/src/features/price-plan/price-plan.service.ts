import { logger } from '@/core/logger';
import { BadRequestError, ErrorCode, NotFoundError } from '@/shared/errors';
import type { PaginationMeta } from '@/shared/types/pagination';
import { buildMeta } from '@/shared/utils/pagination';

import type { CreatePricePlanDto, ListPricePlansQuery, UpdatePricePlanDto } from './price-plan.dto';
import type { PricePlan } from './price-plan.entity';
import type { PricePlanRepository } from './price-plan.repository';
import type { BranchIdsChange, BranchLookup } from './price-plan.types';

export class PricePlanService {
  constructor(
    private readonly repo: PricePlanRepository,
    private readonly branches: BranchLookup,
  ) {}

  /** `isAdmin`: includeInactive chỉ có hiệu lực khi request có token admin */
  async list(
    query: ListPricePlansQuery,
    isAdmin: boolean,
  ): Promise<{ items: PricePlan[]; meta: PaginationMeta }> {
    const { page, limit, sort, branchId } = query;
    const includeInactive = isAdmin && query.includeInactive === true;
    const { items, total } = await this.repo.findMany({
      page,
      limit,
      sort,
      branchId,
      includeInactive,
    });
    return { items, meta: buildMeta(page, limit, total) };
  }

  async get(id: number, includeInactive = false): Promise<PricePlan> {
    const plan = await this.repo.findById(id, includeInactive);
    if (!plan) throw pricePlanNotFound(id);
    return plan;
  }

  async create(
    adminId: number,
    { features, branchIds, ...data }: CreatePricePlanDto,
  ): Promise<PricePlan> {
    const ids = await this.checkBranchIds(branchIds);
    const plan = await this.repo.create(data, features, ids ?? null);
    logger.info({ id: plan.id, adminId }, 'price_plan.created');
    return plan;
  }

  async update(
    adminId: number,
    id: number,
    { features, branchIds, ...data }: UpdatePricePlanDto,
  ): Promise<PricePlan> {
    // Chủ quán sửa được cả gói đang ẩn
    await this.get(id, true);
    const ids = await this.checkBranchIds(branchIds);
    const plan = await this.repo.update(id, data, features, ids);
    logger.info(
      {
        id,
        adminId,
        fields: Object.keys(data),
        featuresChanged: features !== undefined,
        branchesChanged: branchIds !== undefined,
      },
      'price_plan.updated',
    );
    return plan;
  }

  async remove(adminId: number, id: number): Promise<void> {
    await this.get(id, true);
    await this.repo.delete(id);
    logger.info({ id, adminId }, 'price_plan.deleted');
  }

  /**
   * Chuẩn hóa danh sách chi nhánh khi ghi: bỏ id trùng, xếp tăng dần, báo lỗi nếu có chi nhánh không
   * tồn tại. undefined (giữ nguyên) và null (mọi chi nhánh) đi qua nguyên vẹn.
   */
  private async checkBranchIds(branchIds: BranchIdsChange): Promise<BranchIdsChange> {
    if (!branchIds) return branchIds;
    const unique = [...new Set(branchIds)].sort((a, b) => a - b);
    if (!(await this.branches.existsAll(unique))) {
      throw new BadRequestError(
        ErrorCode.PRICE_PLAN_BRANCH_NOT_FOUND,
        'Danh sách chi nhánh có chi nhánh không tồn tại',
      );
    }
    return unique;
  }
}

function pricePlanNotFound(id: number): NotFoundError {
  return new NotFoundError(ErrorCode.PRICE_PLAN_NOT_FOUND, `Không tìm thấy gói giá ${id}`);
}
