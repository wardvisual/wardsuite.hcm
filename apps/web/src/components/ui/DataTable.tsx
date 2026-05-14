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

// Simple column definition used throughout the app
export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
}

export interface DataTableProps<TData, _TValue = unknown> {
  columns: Column<TData>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  keyExtractor?: (row: TData) => string | number;
  showSearch?: boolean;
  searchTerm?: string;
  isLoading?: boolean;
  emptyMessage?: string;
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
    <span className={cn('inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-bold border', badgeVariants[variant])}>
      {label}
    </span>
  );
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  showSearch = false,
  searchTerm,
  isLoading = false,
  emptyMessage = 'No results found.',
}: DataTableProps<TData>) {
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

  // Convert simple Column<T>[] to tanstack ColumnDef<T>[]
  const tanstackColumns = React.useMemo<ColumnDef<TData>[]>(
    () =>
      columns.map((col) => ({
        id: col.key,
        header: col.header,
        cell: ({ row }) => col.cell(row.original),
      })),
    [columns],
  );

  const handleFilterChange = (value: string) => {
    setGlobalFilter(value);
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  const table = useReactTable({
    data,
    columns: tanstackColumns,
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

      <div className="border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] border rounded-[24px] overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[720px] table-auto border-collapse text-left">
            <thead className="border-[#f1f1f1] bg-[#fafafa] border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#aaaaaa] sm:px-6"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-[#aaaaaa] text-sm">
                      <div className="w-4 h-4 border-2 border-[#dddddd] border-t-[#111111] rounded-full animate-spin" />
                      Loading…
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2, delay: index * 0.025 }}
                      onClick={() => onRowClick?.(row.original)}
                      className={cn(
                        'group transition-colors hover:bg-[#fafafa]',
                        onRowClick && 'cursor-pointer'
                      )}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="max-w-[18rem] whitespace-nowrap px-4 py-3.5 text-sm sm:px-6">
                          <div className="truncate">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-[#aaaaaa] text-center text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full min-w-0 items-center justify-between gap-3 text-sm text-[#6b7280] sm:w-auto sm:justify-start">
          <span className="whitespace-nowrap text-[12px] font-medium">
            {totalFiltered === 0
              ? 'No results'
              : `Showing ${startRow}–${endRow} of ${totalFiltered}`}
          </span>
          <select
            className="cursor-pointer whitespace-nowrap rounded-xl border border-[#f1f1f1] bg-white px-3 py-1.5 text-[11px] font-bold text-[#111111] outline-none transition-colors hover:border-[#e0e0e0]"
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

        <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            title="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="shrink-0 rounded-xl border border-[#f1f1f1] p-2 transition-colors hover:bg-gray-50 disabled:opacity-40"
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
                  'h-9 w-9 shrink-0 rounded-xl text-sm font-bold transition-all',
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
            className="shrink-0 rounded-xl border border-[#f1f1f1] p-2 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
