import { Metadata } from "next";
import { CreateGelondonganForm } from "./create-gelondongan-form";

export const metadata: Metadata = {
  title: "Roll Baru | bon",
};

export default function NewGelondonganPage() {
  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Roll Cetak Baru</h1>
          <p className="text-muted-foreground text-sm">Mulai roll & shift produksi baru</p>
        </div>
      </div>
      <CreateGelondonganForm />
    </div>
  );
}