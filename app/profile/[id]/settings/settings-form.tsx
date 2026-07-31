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
}

export function SettingsForm({ profile }: SettingsFormProps) {
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
                    <CardTitle>Profile UUID</CardTitle>
                </CardHeader>
                <CardContent>
                    <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                        {profile.id}
                    </code>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Profile Name</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSaveName}
                        className="flex flex-col gap-4"
                    >
                        <FieldGroup>
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

            <Card className="w-full border-destructive/30">
                <CardHeader>
                    <CardTitle className="text-destructive">
                        Delete Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Deleting this profile will permanently remove
                        all associated transactions. This action cannot
                        be undone.
                    </p>
                    <div className="flex justify-end">
                        <Button
                            variant="destructive"
                            onClick={() =>
                                setDeleteDialogOpen(true)
                            }
                        >
                            Delete Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
