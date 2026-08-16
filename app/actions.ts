"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// for testing
const sleep = (ms: number = 0): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function getProfiles() {
    await sleep();
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
    await sleep();
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
    await sleep();
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

export async function updateProfile(id: string | null, name: string | null) {
    await sleep();
    if (!id) return { success: false, error: "ID cannot be empty." };
    if (!name || !name.trim())
        return { success: false, error: "Name cannot be empty." };
    try {
        const profile = await prisma.profile.findFirst({ where: { id } });

        if (profile === null)
            return { success: false, error: "Profile not found." };

        const result = await prisma.profile.update({
            where: { id: profile.id },
            data: { name: name.trim() },
        });

        revalidatePath(`/profile/${id}`);
        revalidatePath(`/profile/${id}/settings`);
        return { success: true, data: result };
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === "P2002"
        ) {
            return {
                success: false,
                error: "A profile with the same name already exists.",
            };
        }
        console.error("Error updating profile:", error);
        return { success: false, error: `Failed to update profile: ${error}` };
    }
}

export type PageParam = number | "last";
export type TransactionType = "payment" | "debt" | undefined;

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

// ============================================
// ORDERAN (Cash Sales)
// ============================================

export type OrderStatus = "PENDING" | "PRINTING" | "DONE";

export interface OrderItemInput {
    description: string;
    size: string;
    quantity: number;
    unitPrice: number;
    jobType: "CETAK" | "EDIT" | "DESAIN";
    serviceFee: number;
}

export interface CreateOrderInput {
    notaId: string;
    date: Date;
    customerName: string;
    notes?: string;
    items: OrderItemInput[];
}

export async function createOrder(input: CreateOrderInput) {
    await sleep();
    try {
        // Calculate totals
        const itemsWithTotals = input.items.map((item) => {
            const lineTotal = item.quantity * item.unitPrice + item.serviceFee;
            return { ...item, lineTotal };
        });
        const totalAmount = itemsWithTotals.reduce((sum, item) => sum + item.lineTotal, 0);

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    notaId: input.notaId,
                    date: input.date,
                    customerName: input.customerName,
                    notes: input.notes,
                    totalAmount,
                    status: "DONE" as OrderStatus,
                    items: {
                        create: itemsWithTotals.map((item) => ({
                            description: item.description,
                            size: item.size,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            jobType: item.jobType,
                            serviceFee: item.serviceFee,
                            lineTotal: item.lineTotal,
                        })),
                    },
                },
                include: { items: true },
            });
            return newOrder;
        });

        revalidatePath("/orders");
        return { success: true, data: order };
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === "P2002"
        ) {
            return { success: false, error: "Nota ID already exists." };
        }
        console.error("Error creating order:", error);
        return { success: false, error: `Failed to create order: ${error}` };
    }
}

export async function getOrders(
    page: number = 1,
    pageSize: number = 20,
    searchNotaId?: string,
    searchCustomer?: string,
    status?: OrderStatus,
) {
    await sleep();
    try {
        const where: Record<string, unknown> = {};

        if (searchNotaId?.trim()) {
            where.notaId = { contains: searchNotaId.trim(), mode: "insensitive" };
        }
        if (searchCustomer?.trim()) {
            where.customerName = { contains: searchCustomer.trim(), mode: "insensitive" };
        }
        if (status) {
            where.status = status;
        }

        const totalCount = await prisma.order.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const currentPage = Math.min(Math.max(1, page), totalPages);
        const skip = (currentPage - 1) * pageSize;

        const data = await prisma.order.findMany({
            where,
            orderBy: [{ date: "desc" }, { createdAt: "desc" }],
            skip,
            take: pageSize,
            include: { items: { include: { gelondongan: true } } },
        });

        return {
            success: true,
            data,
            pagination: { totalCount, totalPages, currentPage, pageSize },
        };
    } catch (error) {
        console.error("Error fetching orders:", error);
        return { success: false, error: `Failed to get orders: ${error}` };
    }
}

export async function getOrderById(id: string) {
    await sleep();
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { gelondongan: true } } },
        });
        if (!order) return { success: false, error: "Order not found" };
        return { success: true, data: order };
    } catch (error) {
        console.error("Error fetching order:", error);
        return { success: false, error: `Failed to get order: ${error}` };
    }
}

// ============================================
// GELONDONGAN (Print Production)
// ============================================

export type Shift = "PAGI" | "SIANG" | "MALAM";

export interface CreateGelondonganInput {
    rollNumber: number;
    date: Date;
    shift: Shift;
    revenue: number;
    dailyTotal: number;
    rollTotal: number;
}

export async function createGelondongan(input: CreateGelondonganInput) {
    await sleep();
    try {
        const gelondongan = await prisma.gelondongan.create({
            data: {
                rollNumber: input.rollNumber,
                date: input.date,
                shift: input.shift,
                revenue: input.revenue,
                dailyTotal: input.dailyTotal,
                rollTotal: input.rollTotal,
            },
        });
        revalidatePath("/gelondongan");
        return { success: true, data: gelondongan };
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === "P2002"
        ) {
            return { success: false, error: "Roll number already exists." };
        }
        console.error("Error creating gelondongan:", error);
        return { success: false, error: `Failed to create gelondongan: ${error}` };
    }
}

export async function getGelondongans(
    page: number = 1,
    pageSize: number = 20,
) {
    await sleep();
    try {
        const totalCount = await prisma.gelondongan.count();
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const currentPage = Math.min(Math.max(1, page), totalPages);
        const skip = (currentPage - 1) * pageSize;

        const data = await prisma.gelondongan.findMany({
            orderBy: [{ date: "desc" }, { rollNumber: "desc" }],
            skip,
            take: pageSize,
            include: {
                items: {
                    include: { order: true },
                },
            },
        });

        return {
            success: true,
            data,
            pagination: { totalCount, totalPages, currentPage, pageSize },
        };
    } catch (error) {
        console.error("Error fetching gelondongans:", error);
        return { success: false, error: `Failed to get gelondongans: ${error}` };
    }
}

export async function getGelondonganByRollNumber(rollNumber: number) {
    await sleep();
    try {
        const gelondongan = await prisma.gelondongan.findUnique({
            where: { rollNumber },
            include: { items: { include: { order: true } } },
        });
        if (!gelondongan) return { success: false, error: "Gelondongan not found" };
        return { success: true, data: gelondongan };
    } catch (error) {
        console.error("Error fetching gelondongan:", error);
        return { success: false, error: `Failed to get gelondongan: ${error}` };
    }
}

export async function assignItemToGelondongan(itemId: string, gelondonganId: string) {
    await sleep();
    try {
        const item = await prisma.orderItem.update({
            where: { id: itemId },
            data: {
                gelondonganId,
                printedAt: new Date(),
            },
            include: { gelondongan: true },
        });
        revalidatePath("/orders");
        revalidatePath("/gelondongan");
        return { success: true, data: item };
    } catch (error) {
        console.error("Error assigning item to gelondongan:", error);
        return { success: false, error: `Failed to assign item: ${error}` };
    }
}

export async function unassignItemFromGelondongan(itemId: string) {
    await sleep();
    try {
        const item = await prisma.orderItem.update({
            where: { id: itemId },
            data: {
                gelondonganId: null,
                printedAt: null,
            },
        });
        revalidatePath("/orders");
        revalidatePath("/gelondongan");
        return { success: true, data: item };
    } catch (error) {
        console.error("Error unassigning item:", error);
        return { success: false, error: `Failed to unassign item: ${error}` };
    }
}

// Helper to recalculate gelondongan totals
export async function recalculateGelondonganTotals(gelondonganId: string) {
    await sleep();
    try {
        const gelondongan = await prisma.gelondongan.findUnique({
            where: { id: gelondonganId },
            include: { items: true },
        });
        if (!gelondongan) return { success: false, error: "Gelondongan not found" };

        const revenue = gelondongan.items.reduce((sum, item) => sum + item.lineTotal, 0);

        // Get previous gelondongan for dailyTotal calculation
        const previousGelondongan = await prisma.gelondongan.findFirst({
            where: { date: { lte: gelondongan.date }, rollNumber: { lt: gelondongan.rollNumber } },
            orderBy: [{ date: "desc" }, { rollNumber: "desc" }],
        });

        const previousDailyTotal = previousGelondongan?.dailyTotal ?? 0;
        const dailyTotal = previousDailyTotal + revenue;

        const updated = await prisma.gelondongan.update({
            where: { id: gelondonganId },
            data: { revenue, dailyTotal, rollTotal: revenue },
        });

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error recalculating totals:", error);
        return { success: false, error: `Failed to recalculate: ${error}` };
    }
}
