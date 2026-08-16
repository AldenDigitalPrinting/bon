"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  baseUrl: string;
  showPageSize?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

export function Pagination({
  totalPages,
  currentPage,
  baseUrl,
  showPageSize = false,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter((page) => {
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  const buildUrl = (page: number, size?: number) => {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("page", page.toString());
    if (size) url.searchParams.set("pageSize", size.toString());
    else if (url.searchParams.has("pageSize")) url.searchParams.delete("pageSize");
    return url.pathname + url.search;
  };

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-4" aria-label="Pagination">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Halaman {currentPage} dari {totalPages}
        </span>
        {showPageSize && (
          <select
            defaultValue={pageSize}
            onChange={(e) => (window.location.href = buildUrl(1, parseInt(e.target.value)))}
            className="flex h-8 w-auto items-center rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Items per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} per halaman
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          asChild
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <a href={buildUrl(1)}>
            <ChevronsLeft className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          asChild
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <a href={buildUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </a>
        </Button>

        {visiblePages.map((page, index) => {
          const prevPage = visiblePages[index - 1];
          const showEllipsis = prevPage !== undefined && page - prevPage > 1;

          return (
            <span key={page} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-muted-foreground">...</span>
              )}
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                asChild
                className="min-w-[36px]"
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                <a href={buildUrl(page)}>{page}</a>
              </Button>
            </span>
          );
        })}

        <Button
          variant="outline"
          size="icon-sm"
          asChild
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <a href={buildUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          asChild
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <a href={buildUrl(totalPages)}>
            <ChevronsRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </nav>
  );
}