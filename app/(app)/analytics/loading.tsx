import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8 lg:p-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
        <div className="flex flex-col gap-2 min-w-0">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto min-w-0">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
