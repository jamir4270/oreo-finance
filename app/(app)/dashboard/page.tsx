import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Mascot } from "@/components/ui/mascot";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("base_currency")
    .eq("id", user!.id)
    .single();

  const currencySymbol = profile?.base_currency === "USD" ? "$" : 
                         profile?.base_currency === "EUR" ? "€" :
                         profile?.base_currency === "GBP" ? "£" :
                         profile?.base_currency === "PHP" ? "₱" :
                         profile?.base_currency;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-5xl mx-auto w-full">
      {/* Header & Balance */}
      <div className="flex flex-col items-center text-center gap-2 mt-4 md:mt-8">
        <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Total Balance
        </span>
        <h1 className="font-mono text-5xl md:text-7xl font-semibold tracking-tight text-oreo-slate-purple">
          <AnimatedCounter value={0} prefix={currencySymbol} />
        </h1>
      </div>

      {/* Empty State / Welcome */}
      <Card
        className="w-full border-0 mt-8"
        style={{
          boxShadow:
            "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
        }}
      >
        <CardContent className="flex flex-col items-center gap-4 pt-10 pb-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-oreo-lavender/50">
            <Mascot pose="idle" className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h2 className="font-heading text-2xl font-semibold text-oreo-slate-purple">
              Welcome to Oreo!
            </h2>
            <p className="text-sm text-muted-foreground">
              You&apos;re all set up. Once you add your first account and log some transactions, they&apos;ll show up here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grid Placeholders for Future Phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
        <Card className="border-dashed shadow-none bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Activity (Phase 9)</CardTitle>
          </CardHeader>
          <CardContent className="h-32 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No transactions yet</span>
          </CardContent>
        </Card>
        
        <Card className="border-dashed shadow-none bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Accounts (Phase 7)</CardTitle>
          </CardHeader>
          <CardContent className="h-32 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No accounts yet</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
