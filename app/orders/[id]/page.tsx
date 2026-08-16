import { getOrderById } from "@/app/actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, Plus, Printer, Truck, CheckCircle, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { OrderDetail } from "./order-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order Detail | bon",
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data: order, success } = await getOrderById(id);

  if (!success || !order) return notFound();

  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-lg" }),
            )}
            aria-label="Back to orders"
          >
            <ArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{order.notaId}</h1>
            <p className="text-muted-foreground text-sm">
              {format(new Date(order.date), "EEEE, dd MMMM yyyy", { locale: id })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/orders/${id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      <OrderDetail order={order} />
    </div>
  );
}