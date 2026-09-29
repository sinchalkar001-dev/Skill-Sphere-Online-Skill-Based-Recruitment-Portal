import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, hasNext, hasPrev } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push('...');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between py-4">
      <p className="text-sm text-surface-400">
        Showing page <span className="font-medium text-surface-200">{page}</span> of{' '}
        <span className="font-medium text-surface-200">{totalPages}</span>
        <span className="hidden sm:inline"> ({total} total results)</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="p-2 rounded-lg hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-surface-500">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
                p === page
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'hover:bg-surface-700 text-surface-300'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="p-2 rounded-lg hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
