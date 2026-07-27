"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
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

export type PageParam = number | "last";

export async function getTransactionsWithAccumulation(
    profileId: string,
    page: PageParam,
    pageSize: number = 100,
    searchPersonName?: string,
    searchItemName?: string,
    startDate?: string,
    endDate?: string,
) {
    try {
        const where: Prisma.TransactionWhereInput = { profileId };

        if (searchPersonName?.trim()) {
            where.personName = {
                contains: searchPersonName.trim(),
                mode: "insensitive",
            };
            console.log(`searching person name: ${searchPersonName.trim()}`);
        }

        if (searchItemName?.trim()) {
            where.itemName = {
                contains: searchItemName.trim(),
                mode: "insensitive",
            };
            console.log(`searching item name: ${searchItemName.trim()}`);
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
