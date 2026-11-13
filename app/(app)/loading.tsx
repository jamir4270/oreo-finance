import { Skeleton } from "@/components/ui/skeleton";

// Fallback for routes without their own loading.tsx: a generic header + list,
// so navigation never flashes a full-screen loader.
export default function AppLoading() {
  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
