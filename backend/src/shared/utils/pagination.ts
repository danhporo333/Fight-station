import { z } from 'zod';

import { config } from '@/config';
import type { PaginationMeta } from '@/shared/types/pagination';

const { defaultPage, defaultLimit, maxLimit } = config.pagination;

/** Dùng chung trong query schema của endpoint danh sách: `paginationQuerySchema.extend({ ... })` */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(defaultPage),
  limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
  sort: z.string().trim().min(1).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type SortDirection = 'asc' | 'desc';
export type SortSpec<F extends string = string> = Partial<Record<F, SortDirection>>[];

/**
 * `?sort=-createdAt,title` → `[{ createdAt: 'desc' }, { title: 'asc' }]` (dạng `orderBy` của Prisma).
 * Trường không nằm trong `allowed` bị bỏ qua; không còn trường nào thì dùng `fallback`.
 */
export function parseSort<F extends string>(
  sort: string | undefined,
  allowed: readonly F[],
  fallback: SortSpec<F> = [{ sortOrder: 'asc' } as Partial<Record<F, SortDirection>>],
): SortSpec<F> {
  if (!sort) return fallback;
  const result: SortSpec<F> = [];
  for (const raw of sort.split(',')) {
    const token = raw.trim();
    const desc = token.startsWith('-');
    const field = (desc ? token.slice(1) : token) as F;
    if (allowed.includes(field)) {
      result.push({ [field]: desc ? 'desc' : 'asc' } as Partial<Record<F, SortDirection>>);
    }
  }
  return result.length > 0 ? result : fallback;
}

export function toSkipTake({ page, limit }: Pick<PaginationQuery, 'page' | 'limit'>): {
  skip: number;
  take: number;
} {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
