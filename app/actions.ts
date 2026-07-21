"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProfiles() {
    try {
        const profiles = await prisma.profile.findMany({
            orderBy: {
                createdAt: "asc",
            },
        });

        return { success: true, data: profiles };
    } catch (error) {
        console.error(error);
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
        // console.error("Error deleting profile:", error);
        return { success: false, error: `Failed to delete profile: ${error}` };
    }
}

// for testing
const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
