"use server";

import { prisma } from "@/lib/prisma";
import { JobType } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface BannerInput {
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
    serviceFee?: number;
    jobType: JobType;
}

export async function createReceiptWithBanners(
    personName: string,
    items: BannerInput[],
    date?: Date,
) {
    if (!personName || !personName.trim())
        return { success: false, error: "personName cannot be empty." };

    if (!items || items.length === 0)
        return { success: false, error: "Items cannot be empty." };

    for (const item of items) {
        if (item.quantity <= 0)
            return { success: false, error: "Quantity <= 0" };
        if (item.unitPrice <= 0) return { success: false, error: "Price <= 0" };
    }

    const createdAt = date ?? new Date();

    let totalPrice = 0;

    for (const item of items) {
        const lineTotal =
            item.unitPrice * item.quantity +
            (item.serviceFee ? item.serviceFee : 0);

        totalPrice += lineTotal;
    }

    const receipt = await prisma.$transaction(async (tx) => {
        const r = await tx.receipt.create({
            data: { personName, date: createdAt, totalPrice },
        });

        await tx.banner.createMany({
            data: items.map((item) => ({
                receiptId: r.id,
                name: item.name,
                size: item.size,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                serviceFee: item.serviceFee,
                jobType: item.jobType,
                lineTotal:
                    item.quantity * item.unitPrice + (item.serviceFee ?? 0),
            })),
        });

        return await tx.receipt.findUnique({
            where: { id: r.id },
            include: { items: true },
        });
    });

    revalidatePath("/");
    return { success: true, data: receipt };
}
