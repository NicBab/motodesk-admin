"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type {
  PlatformPagination,
} from "@/features/organizations/organization.types";

//************************************************************** */

export function DirectoryPagination({
  pagination,
  itemCount,
  isFetching,
  onPageChange,
  onPageSizeChange,
}: {
  pagination: PlatformPagination;
  itemCount: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const firstItem = itemCount > 0
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 0;

  const lastItem = itemCount > 0
    ? firstItem + itemCount - 1
    : 0;

  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 px-5 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs tabular-nums text-zinc-500">
          Showing {firstItem.toLocaleString()}–{lastItem.toLocaleString()} of{" "}
          {pagination.totalItems.toLocaleString()}
        </p>

        <label className="flex items-center gap-2 text-xs text-zinc-500">
          Rows

          <select
            value={pagination.pageSize}
            disabled={isFetching}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value))
            }
            className="h-8 rounded-lg border border-zinc-300 bg-white px-2 text-xs text-zinc-700 outline-none focus:border-orange-500 disabled:opacity-50"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Previous page"
          disabled={!pagination.hasPreviousPage || isFetching}
          onClick={() => onPageChange(pagination.page - 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-xs tabular-nums text-zinc-600">
          Page {pagination.page} of {pagination.totalPages}
        </span>

        <button
          type="button"
          aria-label="Next page"
          disabled={!pagination.hasNextPage || isFetching}
          onClick={() => onPageChange(pagination.page + 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}

//************************************************************** */