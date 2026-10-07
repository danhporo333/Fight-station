import type { PaginationQuery } from '@/shared/utils/pagination';

/** Điều kiện lọc danh sách món mà service truyền xuống repository */
export interface MenuItemFilter extends Pick<PaginationQuery, 'page' | 'limit' | 'sort'> {
  /** Tìm theo tên món */
  q?: string;
  categoryId?: number;
  /** false = chỉ món tạm hết */
  isAvailable?: boolean;
  /** true: trả cả món ẩn và món thuộc nhóm ẩn (service chỉ bật khi có admin) */
  includeInactive: boolean;
}
