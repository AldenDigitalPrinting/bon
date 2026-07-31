"use client";

// import { Column, ColumnDef } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@prisma/client";
// import { Button } from "@/components/ui/button";
// import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

function formatIDR(amount: number) {
    const partsFormatter = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });

    const cleanIDR = partsFormatter
        .formatToParts(amount)
        .filter((part) => part.type !== "currency")
        .map((part) => part.value)
        .join("")
        .trim();

    return cleanIDR;
}

// interface SortableHeaderProps<T> {
//     column: Column<T, unknown>;
//     title: string;
//     className?: string;
// }

// function SortableHeader<T>({
//     column,
//     title,
//     className,
// }: SortableHeaderProps<T>) {
//     const isSorted = column.getIsSorted();

//     return (
//         <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(isSorted === "asc")}
//             className={className}
//         >
//             <span>{title}</span>
//             {isSorted === "asc" && <ChevronUp className="ml-2 h-4 w-4" />}
//             {isSorted === "desc" && <ChevronDown className="ml-2 h-4 w-4" />}
//             {!isSorted && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
//         </Button>
//     );
// }

interface HeaderProps {
    title: string;
    className?: string;
}

function Header({ title, className }: HeaderProps) {
    return <span className={["", className].join(" ")}>{title}</span>;
}

export type TransactionWithAccumulation = Transaction & {
    accumulation: number;
};

export const columns: ColumnDef<TransactionWithAccumulation>[] = [
    {
        accessorKey: "date",
        header: () => <Header title="Date" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue("date"));
            const formattedDate = date.toLocaleDateString("id-ID", {
                month: "2-digit",
                day: "2-digit",
            });

            return <div>{formattedDate}</div>;
        },
    },
    {
        accessorKey: "personName",
        header: () => <Header title="Person Name" />,
    },
    {
        accessorKey: "itemName",
        header: () => <Header title="Item Name" />,
    },
    {
        accessorKey: "itemQuantity",
        header: () => <Header title="Item Quantity" />,
        cell: ({ row }) => (
            <div className="text-right">{row.getValue("itemQuantity")}</div>
        ),
    },
    {
        accessorKey: "itemPrice",
        header: () => <Header title="Item Price" />,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("itemPrice"));

            const formatted = isNaN(amount) ? "-" : formatIDR(amount);

            return <div className="text-right">{formatted}</div>;
        },
    },
    {
        accessorKey: "debtAdded",
        header: () => <Header title="Debt Added" />,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("debtAdded"));

            const formatted = isNaN(amount) ? "-" : formatIDR(amount);

            return <div className="text-right">{formatted}</div>;
        },
    },
    {
        accessorKey: "debtPaid",
        header: () => <Header title="Debt Paid" />,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("debtPaid"));

            const formatted = isNaN(amount) ? "-" : formatIDR(amount);

            return <div className="text-right">{formatted}</div>;
        },
    },
    {
        accessorKey: "accumulation",
        header: () => <Header title="Accumulation" />,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("accumulation"));

            const formatted = isNaN(amount) ? "-" : formatIDR(amount);

            return <div className="text-right">{formatted}</div>;
        },
    },
];
