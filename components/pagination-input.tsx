"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageNavigationProps {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    disabled?: boolean;
}

// TODO: Show 25, 50, 75, 100 entries per page
export function PageNavigation({
    page,
    totalPages,
    onPageChange,
    disabled,
}: PageNavigationProps) {
    const [prevPage, setPrevPage] = useState(page);
    const [inputValue, setInputValue] = useState<string>(String(page));

    if (prevPage !== page) {
        setPrevPage(page);
        setInputValue(String(page));
    }

    const submitPageChange = () => {
        const parsedPage = parseInt(inputValue, 10);

        if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages) {
            onPageChange(parsedPage);
        } else {
            setInputValue(String(page));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            submitPageChange();
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                disabled={page <= 1 || disabled}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </Button>
            <div className="space-x-1">
                <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={submitPageChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className="h-6 w-12 text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                ></Input>
                <span className="text-sm font-medium text-muted-foreground">
                    / {totalPages || 1}
                </span>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(page + 1, 1))}
                disabled={page >= totalPages || disabled}
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    );
}
