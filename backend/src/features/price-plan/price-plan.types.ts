import type { PaginationQuery } from '@/shared/utils/pagination';

/**
 * Thứ `price-plan` cần biết về chi nhánh. Khai báo ở bên cần (price-plan), `app.ts` truyền
 * BranchService vào; price-plan không import file nội bộ của branch.
 */
export interface BranchLookup {
  /** true nếu mọi id đều là chi nhánh có thật (kể cả đang ẩn) */
  existsAll(ids: number[]): Promise<boolean>;
}

/** Danh sách chi nhánh khi ghi: undefined = giữ nguyên, null = mọi chi nhánh, mảng = thay toàn bộ */
export type BranchIdsChange = number[] | null | undefined;

/** Điều kiện lọc danh sách gói mà service truyền xuống repository */
export interface PricePlanFilter extends Pick<PaginationQuery, 'page' | 'limit' | 'sort'> {
  /** Gói áp dụng ở chi nhánh này: gói riêng của chi nhánh và gói chung (branchId NULL). Trống: mọi gói. */
  branchId?: number;
  /** true: trả cả gói đang ẩn (service chỉ bật khi có admin) */
  includeInactive: boolean;
}
