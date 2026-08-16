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
import { Pagination } from "@/components/ui/pagination";
import { Sunrise, Sun, Moon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface GelondonganTableProps {
  gelondongans: Array<{
    id: string;
    rollNumber: number;
    date: Date | string;
    shift: string;
    revenue: number;
    dailyTotal: number;
    rollTotal: number;
    items: Array<{
      id: string;
      description: string;
      lineTotal: number;
      order: {
        notaId: string;
        customerName: string;
      };
    }>;
  }>;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const shiftIcons = {
  PAGI: Sunrise,
  SIANG: Sun,
  MALAM: Moon,
};

const shiftColors: Record<string, string> = {
  PAGI: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  SIANG: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  MALAM: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export function GelondonganTable({
  gelondongans,
  pagination,
}: GelondonganTableProps) {
  const { totalCount, totalPages, currentPage, pageSize } = pagination;

  const baseUrl = "/gelondongan";

  const buildUrl = (page: number) => {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("page", page.toString());
    return url.pathname + url.search;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption className="text-sm text-muted-foreground p-4">
          Menampilkan {gelondongans.length} dari {totalCount} roll
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Roll</TableHead>
            <TableHead className="w-[150px]">Tanggal</TableHead>
            <TableHead className="w-[100px]">Shift</TableHead>
            <TableHead>Items ({gelondongans.reduce((sum, g) => sum + g.items.length, 0)} total)</TableHead>
            <TableHead className="w-[160px]" style={{ textAlign: "right" }}>
              Pemasukan
            </TableHead>
            <TableHead className="w-[160px]" style={{ textAlign: "right" }}>
              Akumulasi Hari
            </TableHead>
            <TableHead className="w-[160px]" style={{ textAlign: "right" }}>
              Akumulasi Roll
            </TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gelondongans.map((gelondongan) => {
            const ShiftIcon = shiftIcons[gelondongan.shift as keyof typeof shiftIcons] || Sun;
            return (
              <TableRow key={gelondongan.id} className="hover:bg-muted/50">
                <TableCell className="font-mono font-medium">
                  <Link href={`/gelondongan/${gelondongan.rollNumber}`} className="hover:underline">
                    #{gelondongan.rollNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  {format(new Date(gelondongan.date), "dd MMM yyyy", { locale: id })}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={shiftColors[gelondongan.shift]}>
                    <ShiftIcon className="mr-1 h-3 w-3" />
                    {gelondongan.shift}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {gelondongan.items.slice(0, 5).map((item) => (
                      <Badge key={item.id} variant="outline" className="text-xs">
                        {item.description}
                        <span className="text-[10px] opacity-70 ml-1">
                          {formatCurrency(item.lineTotal)}
                        </span>
                      </Badge>
                    ))}
                    {gelondongan.items.length > 5 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        +{gelondongan.items.length - 5} lagi
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {gelondongan.items.length} item{gelondongan.items.length > 1 ? "s" : ""}
                  </div>
                </TableCell>
                <TableCell className="font-mono tabular-nums" style={{ textAlign: "right" }}>
                  {formatCurrency(gelondongan.revenue)}
                </TableCell>
                <TableCell className="font-mono tabular-nums" style={{ textAlign: "right" }}>
                  {formatCurrency(gelondongan.dailyTotal)}
                </TableCell>
                <TableCell className="font-mono tabular-nums" style={{ textAlign: "right" }}>
                  {formatCurrency(gelondongan.rollTotal)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/gelondongan/${gelondongan.rollNumber}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Detail
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
          {gelondongans.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Belum ada roll cetak. Buat roll baru untuk memulai.
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