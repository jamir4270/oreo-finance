import { AlertTriangle } from "lucide-react";

export function StaleRateBanner({ isStale }: { isStale: boolean }) {
  if (!isStale) return null;

  return (
    <div className="flex items-center gap-2 rounded-md bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 border border-amber-200 w-full mb-6">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      <span>Showing last saved exchange rates — may be up to a day old.</span>
    </div>
  );
}
