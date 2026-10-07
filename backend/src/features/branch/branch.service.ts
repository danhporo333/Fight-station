import { logger } from '@/core/logger';
import { ErrorCode, NotFoundError } from '@/shared/errors';
import type { PaginationMeta } from '@/shared/types/pagination';
import { buildMeta } from '@/shared/utils/pagination';

import type { CreateBranchDto, ListBranchesQuery, UpdateBranchDto } from './branch.dto';
import type { Branch } from './branch.entity';
import type { BranchRepository } from './branch.repository';

/**
 * Ngoài CRUD, service này còn thỏa interface `BranchLookup` mà feature `game` khai báo
 * (`existsAll`, `findAllIds`); app.ts truyền nó vào GameService.
 */
export class BranchService {
  constructor(private readonly repo: BranchRepository) {}

  /** `isAdmin`: request có token admin hợp lệ; includeInactive chỉ có hiệu lực khi có admin */
  async list(
    query: ListBranchesQuery,
    isAdmin: boolean,
  ): Promise<{ items: Branch[]; meta: PaginationMeta }> {
    const { page, limit, sort, q } = query;
    const includeInactive = isAdmin && query.includeInactive === true;
    const { items, total } = await this.repo.findMany({ page, limit, sort, q, includeInactive });
    return { items, meta: buildMeta(page, limit, total) };
  }

  async get(id: number, includeInactive = false): Promise<Branch> {
    const branch = await this.repo.findById(id, includeInactive);
    if (!branch) throw branchNotFound();
    return branch;
  }

  async create(adminId: number, dto: CreateBranchDto): Promise<Branch> {
    const branch = await this.repo.create(dto);
    logger.info({ id: branch.id, adminId }, 'branch.created');
    return branch;
  }

  async update(adminId: number, id: number, dto: UpdateBranchDto): Promise<Branch> {
    // Kiểm tra trước để trả BRANCH_001 thay vì lỗi Prisma P2025; quản trị sửa được cả chi nhánh đang ẩn
    await this.get(id, true);
    const branch = await this.repo.update(id, dto);
    logger.info({ id, adminId, fields: Object.keys(dto) }, 'branch.updated');
    return branch;
  }

  /** Xóa thật; dòng branch_game của chi nhánh này tự xóa theo (ON DELETE CASCADE) */
  async remove(adminId: number, id: number): Promise<void> {
    await this.get(id, true);
    await this.repo.delete(id);
    logger.info({ id, adminId }, 'branch.deleted');
  }

  // ─── BranchLookup (dùng bởi game) ───

  /** true nếu mọi id trong danh sách đều là chi nhánh có thật */
  async existsAll(ids: number[]): Promise<boolean> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return true;
    return (await this.repo.countByIds(unique)) === unique.length;
  }

  findAllIds(): Promise<number[]> {
    return this.repo.findAllIds();
  }
}

function branchNotFound(): NotFoundError {
  return new NotFoundError(ErrorCode.BRANCH_NOT_FOUND, 'Không tìm thấy chi nhánh');
}
