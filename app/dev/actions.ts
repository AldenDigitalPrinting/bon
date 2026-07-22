"use server";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Adjust path if needed
import { faker } from "@faker-js/faker";

export async function createDummyTransactions(formData: FormData) {
    if (process.env.NODE_ENV !== "development") {
        notFound();
    }

    const profileId = (formData.get("profileId") as string)?.trim();
    const count = parseInt((formData.get("count") as string) || "1", 10);

    // Custom optional overrides
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
            // 1. Item Name
            const itemName =
                customItemName || faker.helpers.arrayElement(itemsList);
            const isPayment = itemName.toLowerCase().includes("pembayaran");

            // 2. Person Name
            const personName = customPersonName || faker.person.firstName();

            // 3. Date
            const date = rawDate
                ? new Date(rawDate)
                : faker.date.recent({ days: 7 });

            // 4. Quantity & Price
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

            // 5. Debt Added (auto-calculate if not manually specified)
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

            // 6. Debt Paid
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
            });
        }

        await prisma.transaction.createMany({
            data: mockData,
        });

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
