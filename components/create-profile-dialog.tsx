"use client";

import { useState } from "react";
import { createProfile } from "@/app/actions"; // adjust path to actions
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

export function CreateProfileDialog() {
    const [open, setOpen] = useState(false);

    async function handleSubmit(formData: FormData) {
        const name = formData.get("name") as string;
        console.log(await createProfile(name));
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button variant="outline" size="lg" className="p-8">
                        New Profile
                    </Button>
                }
            ></DialogTrigger>

            <DialogContent>
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            Create New Profile
                        </DialogTitle>
                    </DialogHeader>

                    <FieldGroup className="py-4">
                        <Field>
                            <Label htmlFor="profile-name">Name</Label>
                            <Input id="profile-name" name="name" required />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            }
                        ></DialogClose>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
