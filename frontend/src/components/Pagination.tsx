import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (page > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);

    return pages;
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-cream-200">
      <p className="text-sm text-ink-500">
        显示 <span className="font-medium text-ink-700">{startItem}</span> -{' '}
        <span className="font-medium text-ink-700">{endItem}</span> 条，共{' '}
        <span className="font-medium text-ochre-500">{total}</span> 条
      </p>

      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-lg hover:bg-cream-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          title="第一页"
        >
          <ChevronsLeft className="w-4 h-4 text-ink-500" />
        </button>
        <button
          className="p-2 rounded-lg hover:bg-cream-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          title="上一页"
        >
          <ChevronLeft className="w-4 h-4 text-ink-500" />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => (
            <span key={idx}>
              {p === 'ellipsis' ? (
                <span className="px-2 text-ink-400 text-sm">...</span>
              ) : (
                <button
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-ochre-500 text-white'
                      : 'text-ink-600 hover:bg-cream-100'
                  }`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              )}
            </span>
          ))}
        </div>

        <button
          className="p-2 rounded-lg hover:bg-cream-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          title="下一页"
        >
          <ChevronRight className="w-4 h-4 text-ink-500" />
        </button>
        <button
          className="p-2 rounded-lg hover:bg-cream-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          title="最后一页"
        >
          <ChevronsRight className="w-4 h-4 text-ink-500" />
        </button>
      </div>
    </div>
  );
}
