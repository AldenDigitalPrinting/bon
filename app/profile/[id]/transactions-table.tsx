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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// import {
//     Collapsible,
//     CollapsibleContent,
//     CollapsibleTrigger,
// } from "@/components/ui/collapsible";
import { Marker } from "@/components/ui/marker";
import { DateRangeFilterPicker } from "@/app/profile/[id]/date-range-picker";
import { Input } from "@/components/ui/input";
import { PageNavigation } from "@/components/pagination-input";
import { getTransactionsWithAccumulation, type PageParam } from "@/app/actions";
import { columns, type TransactionWithAccumulation } from "./columns";
import { DateRange } from "react-day-picker";
import { X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

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
    // const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState<TransactionWithAccumulation[]>([]);
    const [page, setPage] = useState<PageParam>(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isPending, startTransition] = useTransition();

    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const [searchPersonName, setSearchPersonName] = useState("");
    const [searchItemName, setSearchItemName] = useState("");

    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined,
    );

    useEffect(() => {
        startTransition(async () => {
            const startDateStr = dateRange?.from
                ? dateRange.from.toISOString()
                : undefined;
            const endDateStr = dateRange?.to
                ? dateRange.to.toISOString()
                : undefined;

            const res = await getTransactionsWithAccumulation(
                profileId,
                page,
                Number(pageSize),
                searchPersonName,
                searchItemName,
                startDateStr,
                endDateStr,
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
        searchPersonName,
        searchItemName,
        dateRange,
    ]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),

        manualPagination: true,
        pageCount: totalPages,

        // onSortingChange: setSorting,
        // getSortedRowModel: getSortedRowModel(),
        // state: {
        //     sorting,
        // },
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
        setDateRange(range);
        setPage(1);
    };

    return (
        <>
            {/* Search Input Bar */}
            <div className="flex flex-col sm:flex-row gap-4 w-full mb-4">
                {/* <input
                    type="text"
                    placeholder="Search person name..."
                    className="flex h-9 w-full sm:w-1/2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                    type="text"
                    placeholder="Search item name..."
                    className="flex h-9 w-full sm:w-1/2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    /> */}

                {/* TODO: Collapsible filter */}
                <FieldGroup className="gap-2">
                    {/* <Collapsible>
                        <CollapsibleTrigger
                            render={<Button>Filters</Button>}
                        ></CollapsibleTrigger>
                        <CollapsibleContent> */}
                    <FieldGroup className="flex flex-row mt-2">
                        {/* TODO: Date range filter functionality */}
                        <DateRangeFilterPicker
                            value={dateRange}
                            onChange={handleDataRangeChange}
                            className="max-w-64"
                        ></DateRangeFilterPicker>
                        <Field>
                            <FieldLabel htmlFor="input-field-person-name">
                                Filter Person Name
                            </FieldLabel>
                            <div className="relative w-full">
                                <Input
                                    id="input-field-person-name"
                                    type="text"
                                    placeholder="Search person name..."
                                    value={searchPersonName}
                                    onChange={(e) => {
                                        setSearchPersonName(e.target.value);
                                        setPage(1); // Reset to page 1 on search
                                    }}
                                />
                                {searchPersonName && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchPersonName("");
                                            setPage(1);
                                        }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        aria-label="Clear person name search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="input-field-item-name">
                                Filter Item Name
                            </FieldLabel>
                            <div className="relative w-full">
                                <Input
                                    id="input-field-item-name"
                                    type="text"
                                    placeholder="Search item name..."
                                    value={searchItemName}
                                    onChange={(e) => {
                                        setSearchItemName(e.target.value);
                                        setPage(1); // Reset to page 1 on search
                                    }}
                                />
                                {searchItemName && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchPersonName("");
                                            setPage(1);
                                        }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        aria-label="Clear person name search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </Field>
                    </FieldGroup>
                    {/* </CollapsibleContent>
                    </Collapsible> */}
                </FieldGroup>
            </div>
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
