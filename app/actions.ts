"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// for testing
// const sleep = (ms: number): Promise<void> => {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// };

export async function getProfiles() {
    try {
        const profiles = await prisma.profile.findMany({
            orderBy: {
                createdAt: "asc",
            },
        });

        return { success: true, data: profiles };
    } catch (error) {
        console.error("Error fetching profiles:", error);
        return { success: false, error: `Failed to get profiles: ${error}` };
    }
}

export async function createProfile(name: string | null) {
    if (!name) return { success: false, error: "Name cannot be empty." };
    try {
        const newProfile = await prisma.profile.create({
            data: { name: name.trim() },
        });

        revalidatePath("/");
        return { success: true, data: newProfile };
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === "P2002"
        ) {
            return {
                success: false,
                error: "A profile with the same name already exist.",
            };
        }
        console.error("Error creating profile:", error);
        return { success: false, error: `Failed to create profile: ${error}` };
    }
}

export async function deleteProfile(id: string | null) {
    if (!id) return { success: false, error: "ID cannot be empty." };
    try {
        const profile = await prisma.profile.findFirst({ where: { id: id } });

        if (profile === null)
            return { success: false, error: "Profile not found." };

        const result = await prisma.profile.delete({
            where: { id: profile.id },
        });

        revalidatePath("/");
        return { success: true, data: result };
    } catch (error) {
        console.error("Error deleting profile:", error);
        return { success: false, error: `Failed to delete profile: ${error}` };
    }
}

// TODO: Sort by on findMany()
export async function getTransactionsWithAccumulation(
    profileId: string,
    page: number = 1,
    pageSize: number = 100,
) {
    try {
        const skip = (page - 1) * pageSize;

        const totalCount = await prisma.transaction.count({
            where: { profileId: profileId },
        });

        let priorAccumulation = 0;

        if (skip > 0) {
            const priorTransactions = await prisma.transaction.findMany({
                where: { profileId: profileId },
                orderBy: { date: "asc" },
                take: skip,
                select: { debtAdded: true, debtPaid: true },
            });

            priorAccumulation = priorTransactions.reduce(
                (acc, item) => acc + item.debtAdded - item.debtPaid,
                0,
            );
        }

        const rawTransactions = await prisma.transaction.findMany({
            where: { profileId },
            orderBy: { date: "asc" },
            skip: skip,
            take: pageSize,
        });

        let runningAccumulation = priorAccumulation;

        const transactionsWithAccumulation = rawTransactions.map((item) => {
            runningAccumulation =
                runningAccumulation + item.debtAdded - item.debtPaid;

            return {
                ...item,
                accumulation: runningAccumulation,
            };
        });

        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            success: true,
            data: transactionsWithAccumulation,
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
