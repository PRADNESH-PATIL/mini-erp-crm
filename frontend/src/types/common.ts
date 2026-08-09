export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | Pagination;
    pagination: Pagination;
  };
}