import { Mascot } from "@/components/ui/mascot";

export default function AppLoading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-oreo-lavender/40 shadow-oreo-sm">
        <Mascot pose="idle" className="h-16 w-16" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-heading text-lg font-medium text-oreo-slate-purple animate-pulse">
          Loading...
        </h3>
        <p className="text-sm text-muted-foreground">
          Fetching your finances
        </p>
      </div>
    </div>
  );
}
