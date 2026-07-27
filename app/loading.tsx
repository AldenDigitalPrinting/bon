// app/loading.tsx
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[200px] gap-2">
            <Spinner />
            <span>Fetching profiles...</span>
        </div>
    );
}
