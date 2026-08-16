import { getGelondongans } from "@/app/actions";
import { Metadata } from "next";
import { Plus, Calendar, Sunrise, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GelondonganTable } from "./gelondongan-table";

export const metadata: Metadata = {
  title: "Gelondongan | bon",
  description: "Daftar roll cetak dan shift produksi",
};

export default async function GelondonganPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const { data: gelondongans, pagination } = await getGelondongans(page, 20);

  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gelondongan</h1>
          <p className="text-muted-foreground text-sm">
            Daftar roll cetak & shift produksi
          </p>
        </div>
        <Link
          href="/gelondongan/new"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full sm:w-auto",
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          Roll Baru
        </Link>
      </div>

      <GelondonganTable
        gelondongans={gelondongans || []}
        pagination={pagination}
      />
    </div>
  );
}