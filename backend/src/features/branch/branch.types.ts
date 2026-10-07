import type { PaginationQuery } from '@/shared/utils/pagination';

/** Điều kiện lọc danh sách mà service truyền xuống repository */
export interface BranchFilter extends Pick<PaginationQuery, 'page' | 'limit' | 'sort'> {
  q?: string;
  /** true: trả cả chi nhánh đang ẩn (service chỉ bật khi có admin) */
  includeInactive: boolean;
}
