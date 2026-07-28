import type { PaginationParams, PaginationResult } from '@/types/pagination';

export function buildPagination(
  totalItems: number,
  params: PaginationParams,
): PaginationResult {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function buildPaginationQuery(params: PaginationParams): {
  start: number;
  end: number;
} {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return { start, end };
}
