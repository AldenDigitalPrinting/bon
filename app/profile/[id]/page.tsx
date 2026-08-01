import { prisma } from "@/lib/prisma";
import { TransactionDataTable } from "./transactions-table";

import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Settings } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProfileDetailPage({ params }: PageProps) {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({ where: { id: id } });

    if (!profile) return notFound();

    return (
        <>
            <div className="flex flex-col gap-4  mx-auto my-8 w-full max-w-6xl">
                <div className="flex w-full items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <Link
                            href="/"
                            className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                    size: "icon-lg",
                                }),
                            )}
                            aria-label="Back to profiles"
                            title="Back to profiles"
                        >
                            <ArrowLeft />
                        </Link>
                        <h1 className="text-xl">Transaksi {profile.name}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/profile/${id}/settings`}
                            className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                    size: "icon-lg",
                                }),
                            )}
                            aria-label="Profile settings"
                            title="Profile settings"
                        >
                            <Settings />
                        </Link>
                        <Link
                            href={`/profile/${id}/new`}
                            className={cn(
                                buttonVariants({
                                    variant: "default",
                                    size: "lg",
                                }),
                            )}
                        >
                            <Plus /> Add Record
                        </Link>
                    </div>
                </div>
                <TransactionDataTable profileId={id} verticalBorder={true} />
            </div>
        </>
    );
}
