"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProfile } from "@/app/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";

interface DeleteProfileDialogProps {
    id: string;
    profileName?: string;
}

export function DeleteProfileDialog({
    id,
    profileName,
}: DeleteProfileDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setIsDeleting(true);
        try {
            const response = await deleteProfile(id);

            if (!response.success) {
                toast.error("Failed to delete profile", {
                    description: response.error || "Something went wrong.",
                });
                return;
            }

            toast.success(`Deleted profile ${response.data?.name}`);
        } catch (error) {
            toast.error("Connection/System Error", {
                description:
                    "A network or system error occurred. Please try again later.\n" +
                    error,
            });
        } finally {
            setIsDeleting(false);
            setOpen(false);
            router.push("/");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={<Button variant="destructive">Delete Profile</Button>}
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Are you sure?
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        This action cannot be undone. This will permanently
                        delete{" "}
                        <span className="font-semibold text-foreground">
                            {profileName ? `"${profileName}"` : "this profile"}
                        </span>{" "}
                        and all associated data.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    <DialogClose
                        render={
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                        }
                    />
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
