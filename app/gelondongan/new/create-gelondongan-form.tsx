"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sun, Moon, Plus, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const shifts = ["PAGI", "SIANG", "MALAM"] as const;

const shiftIcons = {
  PAGI: Sunrise,
  SIANG: Sun,
  MALAM: Moon,
};

const shiftLabels = {
  PAGI: "Pagi (06:00-12:00)",
  SIANG: "Siang (12:00-18:00)",
  MALAM: "Malam (18:00-24:00)",
};

export function CreateGelondonganForm() {
  const [rollNumber, setRollNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<"PAGI" | "SIANG" | "MALAM">("PAGI");
  const [revenue, setRevenue] = useState(0);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!rollNumber.trim()) {
      toast.error("Nomor roll harus diisi");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/gelondongan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: parseInt(rollNumber),
          date: new Date(date),
          shift,
          revenue: parseInt(revenue.toString()) || 0,
          dailyTotal: parseInt(dailyTotal.toString()) || 0,
          rollTotal: parseInt(revenue.toString()) || 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Roll cetak berhasil dibuat");
        window.location.href = `/gelondongan/${result.data.rollNumber}`;
      } else {
        toast.error(result.error || "Gagal membuat roll");
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
      <Card>
        <CardHeader>
          <CardTitle>Informasi Roll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="rollNumber">Nomor Roll</Label>
              <Input
                id="rollNumber"
                type="number"
                min="1"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="1, 2, 3..."
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
            <div className="space-y-1.5">
              <Label htmlFor="shift">Shift</Label>
              <Select value={shift} onValueChange={(v) => setShift(v as "PAGI" | "SIANG" | "MALAM")}>
                <SelectTrigger id="shift">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((s) => {
                    const Icon = shiftIcons[s];
                    return (
                      <SelectItem key={s} value={s}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {shiftLabels[s]}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Awal (Opsional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Isi jika roll ini dilanjutkan dari roll sebelumnya atau sudah ada pemasukan awal.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="revenue">Pemasukan Shift Ini</Label>
              <Input
                id="revenue"
                type="number"
                min="0"
                step="1000"
                value={revenue}
                onChange={(e) => setRevenue(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dailyTotal">Akumulasi Hari Ini</Label>
              <Input
                id="dailyTotal"
                type="number"
                min="0"
                step="1000"
                value={dailyTotal}
                onChange={(e) => setDailyTotal(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Akumulasi Roll otomatis sama dengan Pemasukan untuk roll baru.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Membuat..." : "Buat Roll"}
        </Button>
      </div>
    </form>
  );
}