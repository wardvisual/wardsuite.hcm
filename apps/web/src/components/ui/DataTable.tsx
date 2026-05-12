import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  PaginationState,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@web/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  searchKey?: string;
  searchTerm?: string;
  showSearch?: boolean;
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '...')[] = [0];
  if (current > 2) pages.push('...');
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 3) pages.push('...');
  if (total > 1) pages.push(total - 1);
  return pages;
}

interface StatusBadgeProps {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
}
const badgeVariants = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  neutral: 'bg-[#f5f5f5] text-[#6b7280] border-[#ebebeb]',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
};
export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border', badgeVariants[variant])}>
      {label}
    </span>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  searchTerm,
  showSearch = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    if (searchTerm !== undefined) {
      setGlobalFilter(searchTerm);
      setPagination(p => ({ ...p, pageIndex: 0 }));
    }
  }, [searchTerm]);

  const handleFilterChange = (value: string) => {
    setGlobalFilter(value);
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter, pagination },
    onGlobalFilterChange: handleFilterChange as (updater: unknown) => void,
    onPaginationChange: setPagination,
    globalFilterFn: 'includesString',
  });

  const { pageIndex, pageSize } = pagination;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const totalPages = table.getPageCount();
  const startRow = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalFiltered);
  const pageNums = buildPageNumbers(pageIndex, totalPages);

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative max-w-sm">
          <Search className="top-1/2 left-4 absolute w-4 h-4 text-[#6b7280] -translate-y-1/2" />
          <input
            className="pl-11 w-full input-theme"
            placeholder="Search..."
            value={globalFilter}
            onChange={e => handleFilterChange(e.target.value)}
          />
        </div>
      )}

      <div className="border-[#f8f8f8] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse w-full text-left">
            <thead className="border-[#f1f1f1] bg-gray-50/50 border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 font-bold text-[#6b7280] text-[11px] uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#f1f1f1]">
              <AnimatePresence mode="popLayout">
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'group transition-colors hover:bg-[#f9fafb]',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 text-[14px]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-[#6b7280] text-center text-sm"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 px-2">
        <div className="flex items-center gap-3 text-[#6b7280] text-sm">
          <span className="font-medium text-[12px]">
            {totalFiltered === 0
              ? 'No results'
              : `Showing ${startRow}–${endRow} of ${totalFiltered} result${totalFiltered !== 1 ? 's' : ''}`}
          </span>
          <select
            className="border-[#f1f1f1] hover:border-[#e0e0e0] bg-white px-3 py-1.5 border rounded-xl font-bold text-[#111111] text-[11px] transition-colors cursor-pointer outline-none"
            value={pageSize}
            onChange={e => {
              const newSize = Number(e.target.value);
              table.setPageSize(newSize);
              setPagination({ pageIndex: 0, pageSize: newSize });
            }}
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>

        {(
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Previous page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-[#f1f1f1] hover:bg-gray-50 disabled:opacity-40 p-2 border rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            {pageNums.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-[#bbbbbb] text-sm select-none">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => table.setPageIndex(p as number)}
                  className={cn(
                    'w-9 h-9 rounded-xl text-sm font-bold transition-all',
                    p === pageIndex
                      ? 'bg-black text-white shadow-sm'
                      : 'border border-[#f1f1f1] text-[#6b7280] hover:bg-gray-50 hover:border-[#e0e0e0]'
                  )}
                >
                  {(p as number) + 1}
                </button>
              )
            )}

            <button
              type="button"
              title="Next page"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-[#f1f1f1] hover:bg-gray-50 disabled:opacity-40 p-2 border rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
