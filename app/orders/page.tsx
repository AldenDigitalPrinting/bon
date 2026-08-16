import { getOrders } from "@/app/actions";
import { Metadata } from "next";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrdersTable } from "./orders-table";

export const metadata: Metadata = {
  title: "Orderan | bon",
  description: "Cash orders list",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    searchNotaId?: string;
    searchCustomer?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const searchNotaId = params.searchNotaId;
  const searchCustomer = params.searchCustomer;
  const status = params.status;

  const { data: orders, pagination } = await getOrders(
    page,
    20,
    searchNotaId,
    searchCustomer,
    status as "PENDING" | "PRINTING" | "DONE" | undefined,
  );

  const searchParamsObj = new URLSearchParams();
  if (searchNotaId) searchParamsObj.set("searchNotaId", searchNotaId);
  if (searchCustomer) searchParamsObj.set("searchCustomer", searchCustomer);
  if (status) searchParamsObj.set("status", status);

  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Orderan</h1>
          <p className="text-muted-foreground text-sm">Daftar pesanan tunai (bukan bon/piutang)</p>
        </div>
        <Link
          href="/orders/new"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full sm:w-auto",
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          Pesanan Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1" method="GET">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="searchNotaId"
                placeholder="Cari Nota ID..."
                defaultValue={searchNotaId}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="searchCustomer"
                placeholder="Cari Pelanggan..."
                defaultValue={searchCustomer}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <select
              name="status"
              defaultValue={status || ""}
              className="flex h-10 w-[180px] items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">PENDING</option>
              <option value="PRINTING">PRINTING</option>
              <option value="DONE">DONE</option>
            </select>
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </button>
            {(searchNotaId || searchCustomer || status) && (
              <a
                href="/orders"
                className={cn(buttonVariants({ variant: "ghost" }), "h-10 px-4")}
              >
                Clear
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <OrdersTable
        orders={orders || []}
        pagination={pagination}
        searchParams={searchParamsObj.toString()}
      />
    </div>
  );
}