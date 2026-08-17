"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type PageParam = number | "last";
export type TransactionType = "payment" | "debt" | undefined;

// for testing
const sleep = (ms: number = 0): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function getTransactionsWithAccumulation(
    profileId: string,
    page: PageParam,
    pageSize: number = 100,
    searchPersonName?: string,
    searchItemName?: string,
    startDate?: string,
    endDate?: string,
    transactionType?: TransactionType,
) {
    await sleep();
    try {
        const where: Prisma.TransactionWhereInput = { profileId };

        if (searchPersonName?.trim()) {
            where.personName = {
                contains: searchPersonName.trim(),
                mode: "insensitive",
            };
        }

        if (searchItemName?.trim()) {
            where.itemName = {
                contains: searchItemName.trim(),
                mode: "insensitive",
            };
        }

        if (transactionType?.trim()) {
            if (transactionType === "debt") {
                where.debtAdded = {
                    not: 0,
                };
            } else if (transactionType === "payment") {
                where.debtPaid = {
                    not: 0,
                };
            }
        }

        if (startDate || endDate) {
            where.date = {};

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                where.date.gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.date.lte = end;
            } else if (startDate) {
                const end = new Date(startDate);
                end.setHours(23, 59, 59, 999);
                where.date.lte = end;
            }
        }

        const totalCount = await prisma.transaction.count({
            where,
        });
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const currentPage =
            page === "last"
                ? totalPages
                : Math.min(Math.max(1, page), totalPages);
        const skip = (currentPage - 1) * pageSize;

        const data = await prisma.transaction.findMany({
            where,
            orderBy: [{ date: "asc" }, { id: "asc" }],
            skip,
            take: pageSize,
        });

        return {
            success: true,
            data,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                pageSize,
            },
        };
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return {
            success: false,
            error: `Failed to get transactions: ${error}`,
        };
    }
}

export interface TransactionProps {
    profileId: string;
    personName: string;
    itemName: string;
    itemPrice?: number;
    date: Date;
    itemQuantity?: number;
    debtAdded?: number;
    debtPaid?: number;
}

export async function createTransaction({
    profileId,
    personName,
    itemName,
    itemPrice,
    date,
    itemQuantity,
    debtAdded = 0,
    debtPaid = 0,
}: TransactionProps) {
    const latestTransaction = await prisma.transaction.findFirst({
        where: { profileId },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    });

    const previousAccumulation = latestTransaction?.accumulation ?? 0;

    const accumulation = previousAccumulation + debtAdded - debtPaid;

    try {
        const data = {
            profileId,
            date,
            personName,
            itemName,
            itemQuantity,
            itemPrice,
            debtAdded,
            debtPaid,
            accumulation,
        };

        await prisma.transaction.create({
            data,
        });

        revalidatePath(`/profile/${profileId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error creating transaction:", error);
        return { success: false, error: "Failed to create transaction." };
    }
}
