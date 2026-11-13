import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/page-transition";
import { Card } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <PageTransition>
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2 border-b border-border pb-6 mb-8">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
        {[1, 2, 3].map((i) => (
          <section key={i} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Card className="flex flex-col gap-4 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full" />
            </Card>
          </section>
        ))}
      </div>
    </div>
    </PageTransition>
  );
}
