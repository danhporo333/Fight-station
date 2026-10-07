import type { Database } from '@/core/database/prisma';
import { parseSort, toSkipTake } from '@/shared/utils/pagination';

import type { CreateBranchDto, UpdateBranchDto } from './branch.dto';
import { BRANCH_SELECT, BRANCH_SORT_FIELDS, type Branch } from './branch.entity';
import type { BranchFilter } from './branch.types';

export class BranchRepository {
  constructor(private readonly db: Database) {}

  async findMany(filter: BranchFilter): Promise<{ items: Branch[]; total: number }> {
    const where = {
      ...(filter.includeInactive ? {} : { isActive: true }),
      // Collation utf8mb4_0900_ai_ci: contains không phân biệt hoa thường và dấu
      ...(filter.q
        ? { OR: [{ name: { contains: filter.q } }, { address: { contains: filter.q } }] }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.branch.findMany({
        where,
        select: BRANCH_SELECT,
        orderBy: [...parseSort(filter.sort, BRANCH_SORT_FIELDS), { id: 'asc' }],
        ...toSkipTake(filter),
      }),
      this.db.branch.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: number, includeInactive: boolean): Promise<Branch | null> {
    return this.db.branch.findFirst({
      where: { id, ...(includeInactive ? {} : { isActive: true }) },
      select: BRANCH_SELECT,
    });
  }

  create(data: CreateBranchDto): Promise<Branch> {
    return this.db.branch.create({ data, select: BRANCH_SELECT });
  }

  update(id: number, data: UpdateBranchDto): Promise<Branch> {
    return this.db.branch.update({ where: { id }, data, select: BRANCH_SELECT });
  }

  async delete(id: number): Promise<void> {
    await this.db.branch.delete({ where: { id } });
  }

  /** Đếm bao nhiêu id trong danh sách có thật (kể cả chi nhánh đang ẩn) */
  countByIds(ids: number[]): Promise<number> {
    return this.db.branch.count({ where: { id: { in: ids } } });
  }

  async findAllIds(): Promise<number[]> {
    const rows = await this.db.branch.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
    return rows.map((row) => row.id);
  }
}
