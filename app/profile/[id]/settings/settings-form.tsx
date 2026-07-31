"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile, deleteProfile } from "@/app/actions";
import type { Profile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

interface SettingsFormProps {
    profile: Profile;
    transactionCount: number;
}

export function SettingsForm({
    profile,
    transactionCount,
}: SettingsFormProps) {
    const router = useRouter();
    const [name, setName] = useState(profile.name);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleSaveName(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await updateProfile(profile.id, name);

            if (!response.success) {
                toast.error("Failed to update profile", {
                    description:
                        response.error || "Something went wrong.",
                });
                return;
            }

            toast.success("Profile name updated");
        } catch (error) {
            toast.error("Connection/System Error", {
                description:
                    "A network or system error occurred.\n" + error,
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        setIsDeleting(true);

        try {
            const response = await deleteProfile(profile.id);

            if (!response.success) {
                toast.error("Failed to delete profile", {
                    description:
                        response.error || "Something went wrong.",
                });
                return;
            }

            toast.success("Profile deleted");
            router.push("/");
        } catch (error) {
            toast.error("Connection/System Error", {
                description:
                    "A network or system error occurred.\n" + error,
            });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6 items-center mx-auto my-8 w-full max-w-lg">
            <h1 className="text-xl font-medium">Profile Settings</h1>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSaveName}
                        className="flex flex-col gap-4"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Profile UUID</FieldLabel>
                                <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                                    {profile.id}
                                </code>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="profile-name">
                                    Name
                                </FieldLabel>
                                <Input
                                    id="profile-name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    disabled={isSaving}
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel>
                                    Transactions
                                </FieldLabel>
                                <p className="text-sm text-muted-foreground">
                                    {transactionCount.toLocaleString()}{" "}
                                    transaction
                                    {transactionCount === 1
                                        ? ""
                                        : "s"}
                                </p>
                            </Field>
                        </FieldGroup>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner /> Saving
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Separator className="w-full" />

            <div className="w-full rounded-lg border border-destructive/30">
                <div className="border-b border-destructive/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-destructive">
                        Danger Zone
                    </h2>
                </div>
                <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="font-medium">Delete this profile</p>
                        <p className="text-sm text-muted-foreground">
                            Once you delete a profile, there is no going
                            back. All associated transactions will be
                            permanently removed.
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="shrink-0"
                    >
                        Delete this profile
                    </Button>
                </div>
            </div>

            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Profile</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{profile.name}</strong>? This
                            action cannot be undone and all associated
                            transactions will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button
                                    variant="outline"
                                    type="button"
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
                            {isDeleting ? (
                                <>
                                    <Spinner /> Deleting
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
