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
import { getTransactionsWithAccumulation } from "@/app/actions";
import { columns } from "./columns";
import type { TransactionWithAccumulation } from "./columns";

const PAGE_SIZES = [25, 50, 75, 100] as const;

export type PageSize = (typeof PAGE_SIZES)[number];

export const DEFAULT_PAGE_SIZE: PageSize = 25;

export const PAGE_SIZE_OPTIONS = PAGE_SIZES.map((i) => ({
    label: `${i} records per page`,
    value: i,
}));

interface TransactionDataTableProps {
    profileId: string;
    verticalBorder?: boolean;
}

export function TransactionDataTable({
    profileId,
    verticalBorder = false,
}: TransactionDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState<TransactionWithAccumulation[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isPending, startTransition] = useTransition();

    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0].value);

    useEffect(() => {
        startTransition(async () => {
            const res = await getTransactionsWithAccumulation(
                profileId,
                page,
                Number(pageSize),
            );
            if (res.success && res.data && res.pagination) {
                setData(res.data);
                setTotalPages(res.pagination.totalPages);
                setTotalCount(res.pagination.totalCount);
            }
        });
    }, [profileId, page, pageSize]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),

        manualPagination: true,
        pageCount: totalPages,

        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
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
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={
                                                verticalBorder ? "border-r" : ""
                                            }
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
                        page={page}
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
