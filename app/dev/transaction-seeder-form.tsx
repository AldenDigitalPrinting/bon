"use client";

import { useState, useTransition } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createDummyTransactions } from "./actions";

export function TranasctionSeederForm() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{
        success?: boolean;
        message?: string;
    } | null>(null);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus(null);

        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
            const result = await createDummyTransactions(formData);
            if (result.success) {
                setStatus({
                    success: true,
                    message: `Successfully created ${result.count} transaction(s)!`,
                });
            } else {
                setStatus({
                    success: false,
                    message: result.error,
                });
            }
        });
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl">Transactions Seeder</CardTitle>
                <CardDescription>
                    Fill in fields to override specific values, or leave them
                    blank to fall back to random Faker defaults.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Required Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
                        <div className="md:col-span-2 space-y-2">
                            <Label
                                htmlFor="profileId"
                                className="font-semibold"
                            >
                                Target Profile UUID{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="profileId"
                                name="profileId"
                                type="text"
                                placeholder="9e0bb143-1f6f-4621-9cfb-4e8b1f2b4899"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="count" className="font-semibold">
                                Batch Count{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="count"
                                name="count"
                                type="number"
                                min="1"
                                max="10000"
                                defaultValue="1"
                                required
                            />
                        </div>
                    </div>

                    {/* Optional Custom Overrides */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Optional Overrides
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="personName">Person Name</Label>
                                <Input
                                    id="personName"
                                    name="personName"
                                    placeholder="Random name (e.g. A, B, John)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="itemName">Item Name</Label>
                                <Input
                                    id="itemName"
                                    name="itemName"
                                    placeholder="e.g. Buku Tulis, Pembayaran"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="itemQuantity">Quantity</Label>
                                <Input
                                    id="itemQuantity"
                                    name="itemQuantity"
                                    type="number"
                                    min="0"
                                    placeholder="Random / empty"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="itemPrice">
                                    Unit Price (IDR)
                                </Label>
                                <Input
                                    id="itemPrice"
                                    name="itemPrice"
                                    type="number"
                                    min="0"
                                    placeholder="Random / empty"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="debtAdded">
                                    Debt Added (IDR)
                                </Label>
                                <Input
                                    id="debtAdded"
                                    name="debtAdded"
                                    type="number"
                                    min="0"
                                    placeholder="Auto-calculated if blank"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="debtPaid">
                                    Debt Paid (IDR)
                                </Label>
                                <Input
                                    id="debtPaid"
                                    name="debtPaid"
                                    type="number"
                                    min="0"
                                    placeholder="Default: 0"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="date">Transaction Date</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="datetime-local"
                                />
                            </div>
                        </div>
                    </div>

                    {status && (
                        <div
                            className={`p-3 text-sm rounded-md ${
                                status.success
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-destructive/15 text-destructive"
                            }`}
                        >
                            {status.message}
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full"
                    >
                        {isPending
                            ? "Generating Data..."
                            : "Submit Transaction(s)"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
