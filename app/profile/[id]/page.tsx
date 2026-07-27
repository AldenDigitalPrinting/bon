import { prisma } from "@/lib/prisma";
import { TransactionDataTable } from "./transactions-table";
interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProfileDetailPage({ params }: PageProps) {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({ where: { id: id } });

    return (
        <>
            <div className="flex flex-col gap-4 items-center mx-auto my-8 w-full max-w-6xl">
                <h1 className="text-xl">Transaksi {profile?.name}</h1>
                <TransactionDataTable profileId={id} verticalBorder={true} />
            </div>
        </>
    );
}
