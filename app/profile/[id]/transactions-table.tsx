"use client";

import { useState, useEffect, useTransition } from "react";
import {
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageNavigation } from "@/components/pagination-input";
import { getTransactionsWithAccumulation, type PageParam } from "@/app/actions";
import { columns, type TransactionWithAccumulation } from "./columns";

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

    useEffect(() => {
        startTransition(async () => {
            const res = await getTransactionsWithAccumulation(
                profileId,
                page,
                Number(pageSize),
                searchPersonName,
                searchItemName,
            );
            if (res.success && res.data && res.pagination) {
                setData(res.data);
                setTotalPages(res.pagination.totalPages);
                setTotalCount(res.pagination.totalCount);
            }
        });
    }, [profileId, page, pageSize, searchPersonName, searchItemName]);

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

    return (
        <>
            {/* Search Input Bar */}
            <div className="flex flex-col sm:flex-row gap-4 w-full mb-4">
                <input
                    type="text"
                    placeholder="Search person name..."
                    value={searchPersonName}
                    onChange={(e) => {
                        setSearchPersonName(e.target.value);
                        setPage(1); // Reset to page 1 on search
                    }}
                    className="flex h-9 w-full sm:w-1/2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <input
                    type="text"
                    placeholder="Search item name..."
                    value={searchItemName}
                    onChange={(e) => {
                        setSearchItemName(e.target.value);
                        setPage(1); // Reset to page 1 on search
                    }}
                    className="flex h-9 w-full sm:w-1/2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
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
                                    className="h-24 text-center"
                                >
                                    Loading page {page}...
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
                <div className="text-sm text-muted-foreground">
                    Displaying: {data.length} / {totalCount}
                </div>
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
