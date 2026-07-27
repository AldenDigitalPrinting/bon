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

    // const response = await getTransactionsWithAccumulation(id);

    // if (!response.success) {
    //     toast.error("Failed to create profile", {
    //         description:
    //             response.error ||
    //             "Something went wrong. Please check your input and try again.",
    //     });
    //     return;
    // }

    // const data = response.data || [];

    return (
        <>
            {/* <pre>{profile?.name}</pre>
            <pre>{profile?.id}</pre>
            <pre>{profile?.createdAt.toDateString()}</pre>
            <DeleteProfileDialog id={id} profileName={profile?.name} /> */}
            {/* <div className="flex m-auto min-w-full border border-white-600 p-4">
                <Table className="w-full">
                    <TableCaption>
                        Transactions for {profile?.name}
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold border-r w-[100px]">
                                Date
                            </TableHead>
                            <TableHead className="font-bold border-r">
                                Person Name
                            </TableHead>
                            <TableHead className="font-bold border-r">
                                Item Name
                            </TableHead>
                            <TableHead className="font-bold border-r">
                                Item Quantity
                            </TableHead>
                            <TableHead className="font-bold border-r">
                                Item Price
                            </TableHead>
                            <TableHead className="font-bold border-r">
                                Debt Added
                            </TableHead>
                            <TableHead className="font-bold border-r">
                                Debt Paid
                            </TableHead>
                            <TableHead className="font-bold border-r">
                                Accumulation
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="">
                        {response.data?.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell className="border-r">
                                    {t.date.toLocaleDateString("en-US")}
                                </TableCell>
                                <TableCell className="border-r">
                                    {t.personName}
                                </TableCell>
                                <TableCell className="border-r">
                                    {t.itemName}
                                </TableCell>
                                <TableCell className="border-r">
                                    {t.itemQuantity}
                                </TableCell>
                                <TableCell className="border-r">
                                    {t.itemPrice}
                                </TableCell>
                                <TableCell className="border-r">
                                    {t.debtAdded}
                                </TableCell>
                                <TableCell className="border-r">
                                    {t.debtPaid}
                                </TableCell>
                                <TableCell className="border-r">
                                    {t.accumulation}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter></TableFooter>
                </Table>
            </div> */}

            <div className="flex flex-col gap-4 items-center mx-auto my-8">
                <h1 className="text-xl">Transaksi {profile?.name}</h1>
                <TransactionDataTable profileId={id} verticalBorder={true} />
            </div>
        </>
    );
}
