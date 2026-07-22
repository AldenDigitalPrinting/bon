"use client";

import { useState, useEffect, useTransition } from "react";
import {
    ColumnDef,
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
import { columns } from "./columns";
import type { TransactionWithAccumulation } from "./columns";
import { PageNavigation } from "@/components/pagination-input";
import { getTransactionsWithAccumulation } from "@/app/actions";

interface DataTableProps<TData, TValue> {
    profileId: string;
    verticalBorder?: boolean;
}

export function DataTable<TData, TValue>({
    profileId,
    verticalBorder = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState<TransactionWithAccumulation[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isPending, startTransition] = useTransition();

    const pageSize = 5;

    useEffect(() => {
        startTransition(async () => {
            const res = await getTransactionsWithAccumulation(
                profileId,
                page,
                pageSize,
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

    return (
        <>
            <div className="rounded-md border ">
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
            <div className="flex flex-col space-y-2 items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Total records: {totalCount}
                </div>
                <PageNavigation
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                    disabled={isPending}
                />
            </div>
        </>
    );
}
