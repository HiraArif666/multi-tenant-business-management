export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  search?: string;

  status?: boolean;

  page?: number;

  limit?: number;
}