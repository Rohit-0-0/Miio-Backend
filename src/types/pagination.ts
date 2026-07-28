export interface PaginationParams {
  page?: number | undefined;
  limit?: number | undefined;
}

export interface PaginationResult {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
