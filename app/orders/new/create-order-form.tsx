"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calculator, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  description: string;
  size: string;
  quantity: number;
  unitPrice: number;
  jobType: "CETAK" | "EDIT" | "DESAIN";
  serviceFee: number;
}

const jobTypes = ["CETAK", "EDIT", "DESAIN"] as const;

export function CreateOrderForm() {
  const [notaId, setNotaId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { id: crypto.randomUUID(), description: "", size: "", quantity: 1, unitPrice: 0, jobType: "CETAK", serviceFee: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: "", size: "", quantity: 1, unitPrice: 0, jobType: "CETAK", serviceFee: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      toast.error("Minimal 1 item diperlukan");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const calculateLineTotal = (item: OrderItem) => {
    return item.quantity * item.unitPrice + item.serviceFee;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    if (!notaId.trim()) {
      toast.error("Nota ID harus diisi");
      setIsSubmitting(false);
      return;
    }
    if (!customerName.trim()) {
      toast.error("Nama pelanggan harus diisi");
      setIsSubmitting(false);
      return;
    }
    if (items.some((item) => !item.description.trim() || !item.size.trim())) {
      toast.error("Semua item harus memiliki deskripsi dan ukuran");
      setIsSubmitting(false);
      return;
    }

    const itemsToSubmit = items.map((item) => ({
      description: item.description,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      jobType: item.jobType,
      serviceFee: item.serviceFee,
    }));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notaId: notaId.trim(),
          date: new Date(date),
          customerName: customerName.trim(),
          notes: notes.trim() || undefined,
          items: itemsToSubmit,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Pesanan berhasil dibuat");
        window.location.href = `/orders/${result.data.id}`;
      } else {
        toast.error(result.error || "Gagal membuat pesanan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="notaId">Nota ID</Label>
              <Input
                id="notaId"
                value={notaId}
                onChange={(e) => setNotaId(e.target.value)}
                placeholder="NOTA-001"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Nama Pelanggan</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama pelanggan"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items Pesanan</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="space-y-3 p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Item {index + 1}</span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`description-${item.id}`}>Deskripsi</Label>
                  <Input
                    id={`description-${item.id}`}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Contoh: PPDB, Selamat Datang, MPLS"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`size-${item.id}`}>Ukuran</Label>
                  <Input
                    id={`size-${item.id}`}
                    value={item.size}
                    onChange={(e) => updateItem(item.id, "size", e.target.value)}
                    placeholder="3x1, 4x2, dll"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`quantity-${item.id}`}>Jumlah</Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                    className="w-[80px]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`unitPrice-${item.id}`}>Harga Satuan</Label>
                  <Input
                    id={`unitPrice-${item.id}`}
                    type="number"
                    min="0"
                    step="1000"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", parseInt(e.target.value) || 0)}
                    placeholder="17000"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`jobType-${item.id}`}>Jenis</Label>
                  <Select
                    value={item.jobType}
                    onValueChange={(value) => updateItem(item.id, "jobType", value as "CETAK" | "EDIT" | "DESAIN")}
                  >
                    <SelectTrigger id={`jobType-${item.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`serviceFee-${item.id}`}>Biaya Jasa</Label>
                  <Input
                    id={`serviceFee-${item.id}`}
                    type="number"
                    min="0"
                    step="1000"
                    value={item.serviceFee}
                    onChange={(e) => updateItem(item.id, "serviceFee", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calculator className="h-4 w-4" />
                  <span>Subtotal: </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatCurrency(calculateLineTotal(item))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="border-primary">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Total Pesanan</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-primary">
            {formatCurrency(calculateTotal())}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          <X className="mr-2 h-4 w-4" />
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Menyimpan..." : "Simpan Pesanan"}
        </Button>
      </div>
    </form>
  );
}