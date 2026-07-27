"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeFilterPickerProps {
    className?: string;
    value?: DateRange;
    onChange?: (range: DateRange | undefined) => void;
}

export function DateRangeFilterPicker({
    className,
    value,
    onChange,
}: DateRangeFilterPickerProps) {
    return (
        <Field className={className}>
            <FieldLabel htmlFor="date-picker-range">Filter Date</FieldLabel>
            <Popover>
                <PopoverTrigger
                    nativeButton={false}
                    render={
                        <div className="flex relative">
                            <Button
                                variant="outline"
                                id="date-picker-range"
                                className="justify-start px-2.5 font-normal flex w-full"
                            >
                                <CalendarIcon data-icon="inline-start" />
                                {value?.from ? (
                                    <>
                                        <span className="mr-auto">
                                            {value.to ? (
                                                <>
                                                    {format(
                                                        value.from,
                                                        "LLL dd, y",
                                                    )}{" "}
                                                    -{" "}
                                                    {format(
                                                        value.to,
                                                        "LLL dd, y",
                                                    )}
                                                </>
                                            ) : (
                                                format(value.from, "LLL dd, y")
                                            )}
                                        </span>
                                        <span
                                            role="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onChange?.(undefined);
                                            }}
                                            className="mr-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            aria-label="Clear date range filter"
                                        >
                                            <X className="h-4 w-4" />
                                        </span>
                                    </>
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </div>
                    }
                />

                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={onChange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    );
}
