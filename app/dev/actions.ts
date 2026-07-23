"use server";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";

/**
 * Recalculates and updates the running accumulation for ALL transactions
 * of a specific profileId in strict chronological order.
 */
// export async function recalculateProfileAccumulation(profileId: string) {
//     const transactions = await prisma.transaction.findMany({
//         where: { profileId },
//         orderBy: [{ date: "asc" }, { id: "asc" }],
//         select: { id: true, debtAdded: true, debtPaid: true },
//     });

//     let runningAccumulation = 0;

//     // Batch update all rows in a single database transaction
//     const updates = transactions.map((tx) => {
//         runningAccumulation += tx.debtAdded - tx.debtPaid;
//         return prisma.transaction.update({
//             where: { id: tx.id },
//             data: { accumulation: runningAccumulation },
//         });
//     });

//     await prisma.$transaction(updates);
// }

export async function recalculateProfileAccumulation(profileId: string) {
    await prisma.$executeRaw`
        WITH calculated AS (
            SELECT id, SUM("debtAdded" - "debtPaid") OVER (ORDER BY date ASC, id ASC) as new_acc
            FROM "Transaction"
            WHERE "profileId" = ${profileId}
        )
        UPDATE "Transaction" t
        SET accumulation = c.new_acc
        FROM calculated c
        WHERE t.id = c.id
    `;
}

export async function createDummyTransactions(formData: FormData) {
    if (process.env.NODE_ENV !== "development") {
        notFound();
    }

    const profileId = (formData.get("profileId") as string)?.trim();
    const count = parseInt((formData.get("count") as string) || "1", 10);

    const customPersonName = (formData.get("personName") as string)?.trim();
    const customItemName = (formData.get("itemName") as string)?.trim();
    const rawQuantity = formData.get("itemQuantity") as string;
    const rawPrice = formData.get("itemPrice") as string;
    const rawDebtAdded = formData.get("debtAdded") as string;
    const rawDebtPaid = formData.get("debtPaid") as string;
    const rawDate = formData.get("date") as string;

    if (!profileId) {
        return { success: false, error: "Target Profile UUID is required." };
    }

    try {
        const itemsList = [
            "Buku Tulis",
            "Fotocopy",
            "Cetak Foto",
            "Jasa Fotocopy",
            "Jasa",
            "Alat Tulis",
        ];
        const mockData = [];

        for (let i = 0; i < count; i++) {
            const itemName =
                customItemName || faker.helpers.arrayElement(itemsList);
            const isPayment = itemName.toLowerCase().includes("pembayaran");
            const personName = customPersonName || faker.person.firstName();

            const date = rawDate
                ? new Date(rawDate)
                : faker.date.recent({ days: 7 });

            let itemQuantity: number | null = null;
            if (rawQuantity !== "" && rawQuantity !== null) {
                itemQuantity = parseInt(rawQuantity, 10);
            } else if (
                !isPayment &&
                faker.datatype.boolean({ probability: 0.7 })
            ) {
                itemQuantity = faker.number.int({ min: 1, max: 50 });
            }

            let itemPrice: number | null = null;
            if (rawPrice !== "" && rawPrice !== null) {
                itemPrice = parseInt(rawPrice, 10);
            } else if (!isPayment) {
                itemPrice = faker.number.int({
                    min: 400,
                    max: 15000,
                    multipleOf: 100,
                });
            }

            let debtAdded: number;
            if (rawDebtAdded !== "" && rawDebtAdded !== null) {
                debtAdded = parseInt(rawDebtAdded, 10);
            } else if (isPayment) {
                debtAdded = 0;
            } else {
                debtAdded = itemQuantity
                    ? itemQuantity * (itemPrice || 0)
                    : itemPrice || 0;
            }

            let debtPaid: number;
            if (rawDebtPaid !== "" && rawDebtPaid !== null) {
                debtPaid = parseInt(rawDebtPaid, 10);
            } else if (isPayment) {
                debtPaid = faker.number.int({
                    min: 10000,
                    max: 100000,
                    multipleOf: 5000,
                });
            } else {
                debtPaid = 0;
            }

            mockData.push({
                profileId,
                date,
                personName,
                itemName,
                itemQuantity,
                itemPrice,
                debtAdded,
                debtPaid,
                accumulation: 0,
            });
        }

        // Sort chronologically before insertion
        mockData.sort((a, b) => a.date.getTime() - b.date.getTime());

        // 1. Bulk insert seeded rows
        await prisma.transaction.createMany({
            data: mockData,
        });

        // 2. Recalculate stored accumulation for this profile
        await recalculateProfileAccumulation(profileId);

        return { success: true, count };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to generate dummy transactions.",
        };
    }
}
