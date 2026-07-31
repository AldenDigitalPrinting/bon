"use client";

import { useState } from "react";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
    FieldTitle,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewRecordDatePickerInput } from "./date-picker";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createTransaction, type TransactionProps } from "@/app/actions";
import { Spinner } from "@/components/ui/spinner";

interface PageProps {
    profileId: string;
    profileName: string;
    latestAccumulation: number;
}

type FormErrors = {
    personName?: string;
    date?: string;
    itemName?: string;
    itemPrice?: string;
    debtPaid?: string;
};

export function NewRecordForm({
    profileId,
    profileName,
    latestAccumulation,
}: PageProps) {
    const router = useRouter();
    const [transactionType, setTransactionType] = useState<"add" | "pay">(
        "add",
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantity, setQuantity] = useState<string>("1");
    const [price, setPrice] = useState<string>("");
    const [debtPaidInput, setDebtPaidInput] = useState<string>("");
    const [errors, setErrors] = useState<FormErrors>({});

    const isPay = transactionType === "pay";

    const parsedPrice = parseInt(price.replace(/\D/g, ""), 10) || 0;
    const parsedQuantity = quantity.trim() ? parseInt(quantity, 10) : 0;
    const parsedDebtPaid = parseInt(debtPaidInput.replace(/\D/g, ""), 10) || 0;

    const debtAddedPreview = !isPay
        ? parsedQuantity !== null
            ? parsedQuantity * parsedPrice
            : parsedPrice
        : 0;
    const debtPaidPreview = isPay ? parsedDebtPaid : 0;
    const projectedAccumulation =
        latestAccumulation + debtAddedPreview - debtPaidPreview;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);

    const clearError = (field: keyof FormErrors) => {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        const newErrors: FormErrors = {};

        const formData = new FormData(event.currentTarget);
        const personName = formData.get("personName")?.toString();
        const dateRaw = formData.get("date")?.toString();

        // TODO: edit records
        if (!personName) {
            newErrors.personName = "Name is required.";
        }

        if (!dateRaw || isNaN(new Date(dateRaw).getTime())) {
            newErrors.date = "Date is invalid.";
        }

        if (isPay) {
            const debtPaidRaw = formData.get("debtPaid")?.toString().trim();
            const debtPaidValue = debtPaidRaw ? parseInt(debtPaidRaw, 10) : 0;

            if (!debtPaidRaw || isNaN(debtPaidValue) || debtPaidValue <= 0) {
                newErrors.debtPaid = "Payment amount must be greater than 0.";
            }
        } else {
            const itemName = formData.get("itemName")?.toString();
            const itemPriceRaw = formData.get("itemPrice")?.toString().trim();
            const itemPriceValue = itemPriceRaw
                ? parseInt(itemPriceRaw, 10)
                : 0;

            if (!itemName) {
                newErrors.itemName = "Item name is required.";
            }

            if (!itemPriceRaw || isNaN(itemPriceValue) || itemPriceValue <= 0) {
                newErrors.itemPrice = "Item price must be greater than 0.";
            }
        }

        // If errors exist, stop submission and apply styles
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            toast.error("error");
            return;
        }

        setErrors({});

        const date = new Date(dateRaw!);
        const now = new Date();

        date.setHours(
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds(),
        );

        let data: TransactionProps;

        if (isPay) {
            const debtPaidRaw = formData.get("debtPaid")!.toString().trim();
            data = {
                profileId,
                personName: personName!,
                itemName: "Pembayaran",
                debtPaid: parseInt(debtPaidRaw, 10),
                date,
            };
        } else {
            const itemName = formData.get("itemName")!.toString().trim();
            const itemPriceRaw = formData.get("itemPrice")!.toString().trim();
            const itemQuantityRaw = formData
                .get("itemQuantity")
                ?.toString()
                .trim();

            const itemQuantity = itemQuantityRaw
                ? parseInt(itemQuantityRaw, 10)
                : undefined;
            const itemPrice = parseInt(itemPriceRaw, 10);

            const debtAdded =
                itemQuantity !== undefined
                    ? itemQuantity * itemPrice
                    : itemPrice;

            data = {
                profileId,
                personName: personName!,
                itemName,
                itemPrice,
                itemQuantity,
                debtAdded,
                debtPaid: 0,
                date,
            };
        }

        // const data: TransactionProps = {
        //     profileId,
        //     personName,
        //     itemName,
        //     itemQuantity,
        //     itemPrice,
        //     date,
        //     debtAdded,
        //     debtPaid,
        // };

        try {
            const response = await createTransaction(data);

            if (!response.success) {
                toast.error("Failed to add record", {
                    description:
                        response.error ||
                        "Something went wrong. Please check your input and try again.",
                });
                return;
            }

            toast.success(`Record added`);
        } catch (error) {
            toast.error("Connection/System Error", {
                description:
                    "A network or system error occurred. Please try again later.\n" +
                    error,
            });
        } finally {
            setIsSubmitting(false);
            redirect(`/profile/${profileId}`);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-4 items-center m-auto w-full ">
                <div className="min-w-md mt-4">
                    <form
                        className="flex flex-row"
                        id="form"
                        onSubmit={handleSubmit}
                    >
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend className="text-center">
                                    New Record for {profileName}
                                </FieldLegend>
                                <FieldGroup>
                                    <Field
                                        data-invalid={
                                            errors.date ? true : undefined
                                        }
                                    >
                                        <NewRecordDatePickerInput
                                            ariaInvalid={!!errors.date}
                                        ></NewRecordDatePickerInput>
                                        {errors.date && (
                                            <FieldDescription className="text-destructive font-medium">
                                                {errors.date}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            errors.personName ? true : undefined
                                        }
                                    >
                                        <FieldLabel htmlFor="person-name">
                                            Person Name
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="person-name"
                                            placeholder="Alden"
                                            name="personName"
                                            // required
                                            autoFocus
                                            aria-invalid={!!errors.personName}
                                        />
                                        {errors.personName && (
                                            <FieldDescription className="text-destructive font-medium">
                                                {errors.personName}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel>Payment Type</FieldLabel>
                                        <RadioGroup
                                            value={transactionType}
                                            onValueChange={(value) => {
                                                setTransactionType(value);
                                                setErrors({});
                                            }}
                                            className={"flex flex-row"}
                                        >
                                            <FieldLabel htmlFor="add-debt">
                                                <Field orientation="horizontal">
                                                    <RadioGroupItem
                                                        value="add"
                                                        id="add-debt"
                                                    />
                                                    <FieldContent>
                                                        <FieldTitle>
                                                            Add Debt
                                                        </FieldTitle>
                                                    </FieldContent>
                                                </Field>
                                            </FieldLabel>
                                            <FieldLabel htmlFor="pay-debt">
                                                <Field orientation="horizontal">
                                                    <RadioGroupItem
                                                        value="pay"
                                                        id="pay-debt"
                                                    />
                                                    <FieldContent>
                                                        <FieldTitle>
                                                            Pay Debt
                                                        </FieldTitle>
                                                    </FieldContent>
                                                </Field>
                                            </FieldLabel>
                                        </RadioGroup>
                                    </Field>
                                    {isPay ? (
                                        <>
                                            <Field
                                                data-invalid={
                                                    errors.debtPaid
                                                        ? true
                                                        : undefined
                                                }
                                            >
                                                <FieldLabel htmlFor="debt-paid">
                                                    Payment Amount
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupAddon>
                                                        <InputGroupText>
                                                            Rp.
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        id="debt-paid"
                                                        placeholder="50.000"
                                                        name="debtPaid"
                                                        type="number"
                                                        aria-invalid={
                                                            !!errors.debtPaid
                                                        }
                                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        value={debtPaidInput}
                                                        onChange={(e) =>
                                                            setDebtPaidInput(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </InputGroup>
                                                {errors.debtPaid && (
                                                    <FieldDescription className="text-destructive font-medium">
                                                        {errors.debtPaid}
                                                    </FieldDescription>
                                                )}
                                            </Field>
                                        </>
                                    ) : (
                                        <>
                                            <Field
                                                data-invalid={
                                                    errors.itemName
                                                        ? true
                                                        : undefined
                                                }
                                            >
                                                <FieldLabel htmlFor="item-name">
                                                    Item Name
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FieldLabel>
                                                <Input
                                                    id="item-name"
                                                    placeholder="Fotokopi"
                                                    name="itemName"
                                                    aria-invalid={
                                                        !!errors.itemName
                                                    }
                                                    // required
                                                />
                                                {errors.itemName && (
                                                    <FieldDescription className="text-destructive font-medium">
                                                        {errors.itemName}
                                                    </FieldDescription>
                                                )}
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="item-quantity">
                                                    Item Quantity
                                                </FieldLabel>
                                                <Input
                                                    id="item-quantity"
                                                    placeholder="100"
                                                    name="itemQuantity"
                                                    type="number"
                                                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e) =>
                                                        setQuantity(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <FieldDescription>
                                                    Kosongkan jika transaksi
                                                    berupa jasa atau item yang
                                                    tidak dihitung per satuan.
                                                </FieldDescription>
                                            </Field>
                                            <Field
                                                data-invalid={
                                                    errors.itemPrice
                                                        ? true
                                                        : undefined
                                                }
                                            >
                                                <FieldLabel htmlFor="item-price">
                                                    Item Price
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupAddon>
                                                        <InputGroupText>
                                                            Rp.
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        id="item-price"
                                                        placeholder="5.000"
                                                        // required
                                                        name="itemPrice"
                                                        type="number"
                                                        aria-invalid={
                                                            !!errors.itemPrice
                                                        }
                                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        value={price}
                                                        onChange={(e) =>
                                                            setPrice(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {/* <InputGroupAddon align="inline-end">
                                        <InputGroupText>IDR</InputGroupText>
                                    </InputGroupAddon> */}
                                                </InputGroup>
                                                {errors.itemPrice ? (
                                                    <FieldDescription className="text-destructive font-medium">
                                                        {errors.itemPrice}
                                                    </FieldDescription>
                                                ) : (
                                                    <FieldDescription>
                                                        Menyesuaikan dengan
                                                        kondisi jumlah item.
                                                    </FieldDescription>
                                                )}
                                            </Field>
                                        </>
                                    )}
                                    <Field>
                                        <Card>
                                            <CardContent className="space-y-1.5">
                                                <div className="flex justify-between text-muted-foreground text-sm">
                                                    <span>
                                                        Previous Accumulation:
                                                    </span>
                                                    <span>
                                                        {formatCurrency(
                                                            latestAccumulation,
                                                        )}
                                                    </span>
                                                </div>

                                                {isPay ? (
                                                    <div className="flex justify-between text-muted-foreground text-sm">
                                                        <span>Debt Paid:</span>
                                                        <span className="font-medium text-emerald-600">
                                                            -{" "}
                                                            {formatCurrency(
                                                                debtPaidPreview,
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between text-muted-foreground text-sm">
                                                        <span>Debt Added:</span>
                                                        <span className="font-medium text-destructive">
                                                            +{" "}
                                                            {formatCurrency(
                                                                debtAddedPreview,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between font-bold border-t pt-2 mt-2 text-base">
                                                    <span>
                                                        Final Accumulation:
                                                    </span>
                                                    <span>
                                                        {formatCurrency(
                                                            projectedAccumulation,
                                                        )}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Field>

                                    <Field
                                        orientation="horizontal"
                                        className="justify-end gap-2 mt-4"
                                    >
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => router.back()}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Spinner /> {"Saving"}
                                                </>
                                            ) : (
                                                "Submit"
                                            )}
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </>
    );
}
