"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Calculator, Package, Sunrise, Sun, Moon, ArrowRight, XCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  description: string;
  size: string;
  quantity: number;
  unitPrice: number;
  jobType: string;
  serviceFee: number;
  lineTotal: number;
  printedAt: Date | string | null;
  printedBy: string | null;
  order: {
    id: string;
    notaId: string;
    customerName: string;
  };
}

interface Gelondongan {
  id: string;
  rollNumber: number;
  date: Date | string;
  shift: string;
  revenue: number;
  dailyTotal: number;
  rollTotal: number;
  items: OrderItem[];
}

const jobTypeColors: Record<string, string> = {
  CETAK: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  EDIT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  DESAIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const shiftIcons = {
  PAGI: Sunrise,
  SIANG: Sun,
  MALAM: Moon,
};

interface GelondonganDetailProps {
  gelondongan: Gelondongan;
}

export function GelondonganDetail({ gelondongan }: GelondonganDetailProps) {
  const ShiftIcon = shiftIcons[gelondongan.shift as keyof typeof shiftIcons] || Sun;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pemasukan Shift</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums text-primary">
              {formatCurrency(gelondongan.revenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akumulasi Hari Ini</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">
              {formatCurrency(gelondongan.dailyTotal)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akumulasi Roll</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums text-green-600">
              {formatCurrency(gelondongan.rollTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">
              {gelondongan.items.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roll Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShiftIcon className="h-5 w-5" />
            Informasi Roll
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nomor Roll</p>
            <p className="font-mono font-semibold text-lg">#{gelondongan.rollNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tanggal</p>
            <p className="font-semibold">
              {format(new Date(gelondongan.date), "EEEE, dd MMMM yyyy", { locale: id })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Shift</p>
            <Badge variant="secondary" className="text-base px-3 py-1">
              <ShiftIcon className="mr-1 h-3 w-3" />
              {gelondongan.shift}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items pada Roll Ini ({gelondongan.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {gelondongan.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Belum ada item yang dicetak pada roll ini.</p>
              <p className="text-sm">Assign item dari Orderan ke roll ini.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Deskripsi</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Nota / Pelanggan</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Qty</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Jenis</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Waktu Cetak</th>
                  </tr>
                </thead>
                <tbody>
                  {gelondongan.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {item.size} × {item.quantity}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{item.order.notaId}</div>
                        <div className="text-sm text-muted-foreground">{item.order.customerName}</div>
                      </td>
                      <td className="p-4 text-right font-mono tabular-nums">{item.quantity}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className={cn(jobTypeColors[item.jobType])}>
                          {item.jobType}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-mono tabular-nums font-medium">
                        {formatCurrency(item.lineTotal)}
                      </td>
                      <td className="p-4">
                        {item.printedAt ? (
                          <span className="text-sm text-green-600 dark:text-green-400">
                            {format(new Date(item.printedAt), "dd/MM HH:mm", { locale: id })}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Belum dicatat</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-bold">
                    <td colSpan={4} className="p-4 text-right">Total Roll</td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {formatCurrency(gelondongan.rollTotal)}
                    </td>
                    <td className="p-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Running Total Explanation */}
      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Perhitungan Akumulasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between font-mono tabular-nums">
            <span>Pemasukan roll ini:</span>
            <span className="font-semibold">{formatCurrency(gelondongan.revenue)}</span>
          </div>
          <div className="flex justify-between font-mono tabular-nums text-blue-600 dark:text-blue-400">
            <span>Akumulasi Roll (rollTotal):</span>
            <span className="font-semibold">{formatCurrency(gelondongan.rollTotal)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-mono tabular-nums">
            <span>Akumulasi hari sebelumnya (dailyTotal - rollTotal):</span>
            <span>{formatCurrency(gelondongan.dailyTotal - gelondongan.rollTotal)}</span>
          </div>
          <div className="flex justify-between font-mono tabular-nums text-blue-600 dark:text-blue-400">
            <span>Akumulasi Hari Ini (dailyTotal):</span>
            <span className="font-semibold">{formatCurrency(gelondongan.dailyTotal)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}