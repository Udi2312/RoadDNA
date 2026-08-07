// ─── Offset-based pagination helper ───

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(query: {
  page?: string | number;
  limit?: string | number;
}): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(query.limit) || DEFAULT_PAGE_SIZE)
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
