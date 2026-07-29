"use-client";

import { prisma } from "@/lib/prisma";
import { NewRecordForm } from "./new-record-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function NewRecordPage({ params }: PageProps) {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({ where: { id: id } });

    if (!profile) {
        notFound();
    }

    const latestTransaction = await prisma.transaction.findFirst({
        where: { profileId: id },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    });

    return (
        <>
            <div className="flex flex-col gap-4 items-center m-auto w-full ">
                <div className="min-w-md mt-4">
                    <NewRecordForm
                        profileId={id}
                        profileName={profile.name}
                        latestAccumulation={
                            latestTransaction?.accumulation || 0
                        }
                    />
                </div>
            </div>
        </>
    );
}
