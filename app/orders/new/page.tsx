import { Metadata } from "next";
import { CreateOrderForm } from "./create-order-form";

export const metadata: Metadata = {
  title: "Pesanan Baru | bon",
};

export default function NewOrderPage() {
  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Pesanan Baru</h1>
          <p className="text-muted-foreground text-sm">Buat pesanan tunai (orderan)</p>
        </div>
      </div>
      <CreateOrderForm />
    </div>
  );
}