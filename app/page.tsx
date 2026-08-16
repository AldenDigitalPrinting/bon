import { getProfiles } from "./actions";
import { buttonVariants } from "@/components/ui/button";
import { CreateProfileDialog } from "@/components/create-profile-dialog";
import Link from "next/link";
import { CreditCard, FileText, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function Home() {
    const profiles = await getProfiles();

    return (
        <div className="flex flex-col m-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">bon</h1>
            <p className="text-muted-foreground">Alden Digital Printing</p>
          </div>

          {/* Bon (Debt Tracking) */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bon / Piutang
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Catat transaksi tertunda (bon) per pelanggan
            </p>
            <div className="flex flex-row gap-2 flex-wrap">
              {profiles.data?.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "p-6 min-w-[200px]",
                  })}
                >
                  {profile.name}
                </Link>
              ))}
              <CreateProfileDialog />
            </div>
          </section>

          {/* Orderan (Cash Sales) */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Orderan (Pesanan Tunai)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Kelola pesanan tunai & detail item cetak
            </p>
            <div className="flex flex-row gap-2 flex-wrap">
              <Link
                href="/orders"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "p-6 min-w-[200px] flex items-center gap-2"
                )}
              >
                <FileText className="h-5 w-5" />
                Daftar Pesanan
              </Link>
              <Link
                href="/orders/new"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "p-6 min-w-[200px] flex items-center gap-2"
                )}
              >
                <FileText className="h-5 w-5" />
                Pesanan Baru
              </Link>
            </div>
          </section>

          {/* Gelondongan (Production) */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gelondongan (Produksi Cetak)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Kelola roll cetak, shift & akumulasi pendapatan
            </p>
            <div className="flex flex-row gap-2 flex-wrap">
              <Link
                href="/gelondongan"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "p-6 min-w-[200px] flex items-center gap-2"
                )}
              >
                <Package className="h-5 w-5" />
                Daftar Roll
              </Link>
              <Link
                href="/gelondongan/new"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "p-6 min-w-[200px] flex items-center gap-2"
                )}
              >
                <Package className="h-5 w-5" />
                Roll Baru
              </Link>
            </div>
          </section>
        </div>
    );
}
