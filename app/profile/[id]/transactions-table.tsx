"use client";

import { useState, useEffect, useTransition } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Button, buttonVariants } from "@/components/ui/button";
import { Marker } from "@/components/ui/marker";
import { DateRangeFilterPicker } from "@/app/profile/[id]/date-range-picker";
import { PageNavigation } from "@/components/pagination-input";
import {
    getTransactionsWithAccumulation,
    type PageParam,
    type TransactionType,
} from "@/app/actions";
import { columns, type TransactionWithAccumulation } from "./columns";
import { DateRange } from "react-day-picker";
import { X, Plus, FunnelX } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const PAGE_SIZES = [10, 25, 50, 75, 100] as const;

export type PageSize = (typeof PAGE_SIZES)[number];

export const DEFAULT_PAGE_SIZE: PageSize = 10;

export const PAGE_SIZE_OPTIONS = PAGE_SIZES.map((i) => ({
    label: `${i} records per page`,
    value: i,
}));

interface TransactionDataTableProps {
    profileId: string;
    verticalBorder?: boolean;
    initialPage?: PageParam;
}

export function TransactionDataTable({
    profileId,
    verticalBorder = false,
    initialPage = "last",
}: TransactionDataTableProps) {
    const [data, setData] = useState<TransactionWithAccumulation[]>([]);
    const [page, setPage] = useState<PageParam>(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isPending, startTransition] = useTransition();

    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    // Filters
    const [filterSearchPersonName, setFilterSearchPersonName] = useState("");
    const [filterSearchItemName, setFilterSearchItemName] = useState("");
    const [filterTransactionType, setFilterTransactionType] =
        useState<TransactionType>();
    const [filterDateRange, setFilterDateRange] = useState<
        DateRange | undefined
    >(undefined);
    const [filterEnabled, setFilterEnabled] = useState(false);

    useEffect(() => {
        setFilterEnabled(
            filterSearchPersonName !== "" ||
                filterSearchItemName !== "" ||
                filterTransactionType !== undefined ||
                filterDateRange !== undefined,
        );

        startTransition(async () => {
            const startDateStr = filterDateRange?.from
                ? filterDateRange.from.toISOString()
                : undefined;
            const endDateStr = filterDateRange?.to
                ? filterDateRange.to.toISOString()
                : undefined;

            const res = await getTransactionsWithAccumulation(
                profileId,
                page,
                Number(pageSize),
                filterSearchPersonName,
                filterSearchItemName,
                startDateStr,
                endDateStr,
                filterTransactionType,
            );
            if (res.success && res.data && res.pagination) {
                setData(res.data);
                setTotalPages(res.pagination.totalPages);
                setTotalCount(res.pagination.totalCount);
            }
        });
    }, [
        profileId,
        page,
        pageSize,
        filterSearchPersonName,
        filterSearchItemName,
        filterDateRange,
        filterTransactionType,
    ]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),

        manualPagination: true,
        pageCount: totalPages,
    });

    const handlePageSizeChange = (size: string | null) => {
        if (size === null) return;
        const newSize = Number(size) as PageSize;
        if (!isNaN(newSize)) {
            setPageSize(newSize);
            setPage(1);
        }
    };

    const handleDataRangeChange = (range: DateRange | undefined) => {
        setFilterDateRange(range);
        setPage(1);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row w-full mb-4">
                <FieldGroup className="gap-2 flex flex-col">
                    <FieldLegend>Filters</FieldLegend>
                    <FieldGroup className="flex flex-row w-auto">
                        <Field className="max-w-max">
                            <DateRangeFilterPicker
                                value={filterDateRange}
                                onChange={handleDataRangeChange}
                                className="max-w-64"
                            ></DateRangeFilterPicker>
                        </Field>
                        <Field className="max-w-max">
                            <InputGroup>
                                <InputGroupInput
                                    id="input-field-person-name"
                                    placeholder="Search person name..."
                                    value={filterSearchPersonName}
                                    onChange={(e) => {
                                        setFilterSearchPersonName(
                                            e.target.value,
                                        );
                                        setPage(1);
                                    }}
                                />
                                {filterSearchPersonName && (
                                    <InputGroupAddon align="inline-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterSearchPersonName("");
                                                setPage(1);
                                            }}
                                            className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            aria-label="Clear person name search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </InputGroupAddon>
                                )}
                            </InputGroup>
                        </Field>
                        <Field className="max-w-max">
                            <InputGroup>
                                <InputGroupInput
                                    id="input-field-item-name"
                                    type="text"
                                    placeholder="Search item name..."
                                    value={filterSearchItemName}
                                    onChange={(e) => {
                                        setFilterSearchItemName(e.target.value);
                                        setPage(1); // Reset to page 1 on search
                                    }}
                                />
                                {filterSearchItemName && (
                                    <InputGroupAddon align="inline-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterSearchItemName("");
                                                setPage(1);
                                            }}
                                            className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            aria-label="Clear person name search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </InputGroupAddon>
                                )}
                            </InputGroup>
                        </Field>
                        <Field className="w-auto">
                            <ToggleGroup
                                className="flex flex-row gap-1"
                                value={
                                    filterTransactionType
                                        ? [filterTransactionType]
                                        : []
                                }
                                onValueChange={(value) => {
                                    setFilterTransactionType(
                                        value[0] as TransactionType,
                                    );
                                    setPage(1);
                                }}
                            >
                                <ToggleGroupItem
                                    variant="outline"
                                    size="lg"
                                    value={"payment" as TransactionType}
                                >
                                    Payment
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    variant="outline"
                                    size="lg"
                                    value={"debt" as TransactionType}
                                >
                                    Debt
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </Field>
                        {filterEnabled && (
                            <Field className="max-w-fit">
                                <Button
                                    variant={"ghost"}
                                    onClick={() => {
                                        setFilterSearchItemName("");
                                        setFilterSearchPersonName("");
                                        setFilterTransactionType(undefined);
                                        setFilterDateRange(undefined);
                                        setPage(1);
                                    }}
                                >
                                    <FunnelX /> Clear Filters
                                </Button>
                            </Field>
                        )}
                    </FieldGroup>
                </FieldGroup>
            </div>
            {/* Where should i put this
            <Link
                href={`/profile/${profileId}/new`}
                className={
                    "min-w-12 whitespace-nowrap " +
                    buttonVariants({
                        variant: "default",
                        size: "lg",
                    })
                }
            >
                <Plus /> Add Record
            </Link>
            */}
            <div className="rounded-md border w-full">
                <Table className="w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={[
                                                verticalBorder
                                                    ? "border-r"
                                                    : "",
                                            ].join(" ")}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isPending ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24"
                                >
                                    <Marker className="flex items-center justify-center text-center">
                                        <Spinner />
                                        Fetching transactions data...
                                    </Marker>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            className={
                                                verticalBorder ? "border-r" : ""
                                            }
                                            key={cell.id}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className={
                                        "h-24 text-center" + verticalBorder
                                            ? "border-r"
                                            : ""
                                    }
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center w-full px-2">
                <Marker className="max-w-max">
                    Displaying: {data.length} / {totalCount}
                </Marker>
                <div className="m-auto">
                    <PageNavigation
                        page={typeof page === "number" ? page : totalPages}
                        totalPages={totalPages}
                        onPageChange={(newPage) => setPage(newPage)}
                        disabled={isPending}
                    />
                </div>
                <Field className="w-full max-w-48">
                    <Select
                        items={PAGE_SIZE_OPTIONS}
                        value={
                            PAGE_SIZE_OPTIONS.find(
                                ({ value }) => value === pageSize,
                            )?.label || String(pageSize)
                        }
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {PAGE_SIZE_OPTIONS.map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            </div>
        </>
    );
}
