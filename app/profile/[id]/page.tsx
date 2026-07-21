import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { deleteProfile } from "@/app/actions";
import { DeleteProfileDialog } from "@/components/delete-profile.dialog";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProfileDetailPage({ params }: PageProps) {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({ where: { id: id } });

    async function handleSubmit(id: string) {
        await deleteProfile(id);
        return undefined;
    }

    return (
        <>
            <pre>{profile?.name}</pre>
            <pre>{profile?.id}</pre>
            <pre>{profile?.createdAt.toDateString()}</pre>
            <DeleteProfileDialog id={id} profileName={profile?.name} />
        </>
    );
}
