export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const rawLimit = parseInt(String(query.limit || '20'), 10) || 20;
  const limit = Math.min(100, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;
  const take = limit;
  const sort = typeof query.sort === 'string' && query.sort.trim() ? query.sort.trim() : 'createdAt';
  const orderRaw = typeof query.order === 'string' ? query.order.toLowerCase() : 'desc';
  const order: 'asc' | 'desc' = orderRaw === 'asc' ? 'asc' : 'desc';
  const search = typeof query.search === 'string' && query.search.trim() ? query.search.trim() : undefined;

  return {
    page,
    limit,
    skip,
    take,
    sort,
    order,
    search,
  };
}

export function buildPaginationResponse(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
  };
}
