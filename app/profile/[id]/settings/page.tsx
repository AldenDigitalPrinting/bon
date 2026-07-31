import { prisma } from "@/lib/prisma";
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
        <SettingsForm
            profile={profile}
            transactionCount={profile._count.transactions}
        />
    );
}
