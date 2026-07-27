"use client";

import { useState } from "react";
import { createProfile } from "@/app/actions";
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
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "./ui/spinner";

export function CreateProfileDialog() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;

        try {
            const response = await createProfile(name);

            if (!response.success) {
                toast.error("Failed to create profile", {
                    description:
                        response.error ||
                        "Something went wrong. Please check your input and try again.",
                });
                return;
            }

            toast.success(`Created profile ${response.data?.name}`);
        } catch (error) {
            toast.error("Connection/System Error", {
                description:
                    "A network or system error occurred. Please try again later.\n" +
                    error,
            });
        } finally {
            setIsSubmitting(false);
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button
                        nativeButton={true}
                        variant="outline"
                        size="lg"
                        className="p-8"
                    >
                        New Profile
                    </Button>
                }
            ></DialogTrigger>

            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            Create new profile
                        </DialogTitle>
                    </DialogHeader>

                    <FieldGroup className="py-4">
                        <Field>
                            <Label htmlFor="profile-name">Name</Label>
                            <Input
                                id="profile-name"
                                name="name"
                                required
                                disabled={isSubmitting}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button
                                    nativeButton={true}
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            }
                        ></DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Spinner data-icon="inline-start" />
                                    {"Creating"}
                                </>
                            ) : (
                                "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
