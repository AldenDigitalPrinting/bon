import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { SettingsForm } from "./settings-form";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function SettingsPage({ params }: PageProps) {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({
        where: { id },
        include: { _count: { select: { transactions: true } } },
    });

    if (!profile) {
        notFound();
    }

    return (
        <>
            <div className="flex w-full max-w-lg mx-auto mt-4">
                <Link
                    href={`/profile/${id}`}
                    className={cn(
                        buttonVariants({
                            variant: "ghost",
                            size: "sm",
                        }),
                    )}
                >
                    <ArrowLeft /> Back
                </Link>
            </div>
            <SettingsForm
                profile={profile}
                transactionCount={profile._count.transactions}
            />
        </>
    );
}
