import { getGelondonganByRollNumber } from "@/app/actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, Plus, Sunrise, Sun, Moon, CheckCircle, Calculator, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { GelondonganDetail } from "./gelondongan-detail";

interface PageProps {
  params: Promise<{ rollNumber: string }>;
}

export const metadata: Metadata = {
  title: "Roll Detail | bon",
};

export default async function GelondonganDetailPage({ params }: PageProps) {
  const { rollNumber } = await params;
  const { data: gelondongan, success } = await getGelondonganByRollNumber(parseInt(rollNumber));

  if (!success || !gelondongan) return notFound();

  const ShiftIcon = gelondongan.shift === "PAGI" ? Sunrise : gelondongan.shift === "SIANG" ? Sun : Moon;

  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/gelondongan"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-lg" }),
            )}
            aria-label="Back to gelondongan"
          >
            <ArrowLeft />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Roll #{gelondongan.rollNumber}</h1>
              <Badge variant="secondary" className="text-sm">
                <ShiftIcon className="mr-1 h-3 w-3" />
                {gelondongan.shift}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {format(new Date(gelondongan.date), "EEEE, dd MMMM yyyy", { locale: id })}
            </p>
          </div>
        </div>
      </div>

      <GelondonganDetail gelondongan={gelondongan} />
    </div>
  );
}