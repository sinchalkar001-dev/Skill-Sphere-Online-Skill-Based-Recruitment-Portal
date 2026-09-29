import { PAGINATION } from './constants.js';

/**
 * Parse pagination params from query string
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination response metadata
 */
export const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
