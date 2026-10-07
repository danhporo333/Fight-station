import type { PaginationQuery } from '@/shared/utils/pagination';

/**
 * Thứ `game` cần biết về chi nhánh. Khai báo ở bên cần (game), `app.ts` truyền BranchService vào;
 * game không import file nội bộ của branch.
 */
export interface BranchLookup {
  /** true nếu mọi id đều là chi nhánh có thật (kể cả đang ẩn) */
  existsAll(ids: number[]): Promise<boolean>;
}

/** Điều kiện lọc danh sách game mà service truyền xuống repository */
export interface GameFilter extends Pick<PaginationQuery, 'page' | 'limit' | 'sort'> {
  q?: string;
  categoryId?: number;
  /** Game có ở chi nhánh này: không có dòng branch_game nào (mọi chi nhánh) hoặc có dòng của chi nhánh */
  branchId?: number;
  /** true: trả cả game ẩn và game thuộc thể loại ẩn (service chỉ bật khi có admin) */
  includeInactive: boolean;
}

/** Danh sách chi nhánh khi ghi: undefined = giữ nguyên, null = mọi chi nhánh, mảng = thay toàn bộ */
export type BranchIdsChange = number[] | null | undefined;
