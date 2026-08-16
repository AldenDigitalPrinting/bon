"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface OrdersTableProps {
  orders: Array<{
    id: string;
    notaId: string;
    date: Date | string;
    customerName: string;
    notes: string | null;
    totalAmount: number;
    status: string;
    items: Array<{
      id: string;
      description: string;
      gelondonganId: string | null;
      gelondongan: {
        rollNumber: number;
        shift: string;
      } | null;
    }>;
  }>;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  searchParams: string;
}

export function OrdersTable({
  orders,
  pagination,
  searchParams,
}: OrdersTableProps) {
  const { totalCount, totalPages, currentPage, pageSize } = pagination;

  const statusStyles: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "outline",
    PRINTING: "default",
    DONE: "secondary",
  };

  const baseUrl = searchParams ? `/orders?${searchParams}` : "/orders";

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption className="text-sm text-muted-foreground p-4">
          Menampilkan {orders.length} dari {totalCount} pesanan
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nota ID</TableHead>
            <TableHead className="w-[120px]">Tanggal</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="w-[180px]" style={{ textAlign: "right" }}>
              Total
            </TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/50">
              <TableCell className="font-mono font-medium">
                <Link href={`/orders/${order.id}`} className="hover:underline">
                  {order.notaId}
                </Link>
              </TableCell>
              <TableCell>
                {format(new Date(order.date), "dd MMM yyyy", { locale: id })}
              </TableCell>
              <TableCell>
                <div className="font-medium">{order.customerName}</div>
                {order.notes && (
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {order.notes}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {order.items.map((item) => (
                    <Badge
                      key={item.id}
                      variant={item.gelondonganId ? "secondary" : "outline"}
                      className="text-xs gap-1"
                    >
                      {item.description}
                      {item.gelondonganId && (
                        <span className="text-[10px] opacity-70">
                          R{item.gelondongan?.rollNumber}-{item.gelondongan?.shift[0]}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </div>
              </TableCell>
              <TableCell className="font-mono tabular-nums" style={{ textAlign: "right" }}>
                {formatCurrency(order.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge variant={statusStyles[order.status] || "outline"}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Detail
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Tidak ada pesanan ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="border-t p-4">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          baseUrl={baseUrl}
          showPageSize={true}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}