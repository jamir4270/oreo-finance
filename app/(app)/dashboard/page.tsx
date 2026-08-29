import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import Image from "next/image";

/**
 * Dashboard placeholder — Phase 5.
 *
 * Proves the authenticated session works end-to-end:
 *  - Shows the logged-in user's email
 *  - Shows their base_currency setting
 *  - Provides a logout button
 *
 * Phase 6+ will replace this with the full app shell and dashboard content.
 */
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

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Mascot */}
        <div
          className="flex items-center justify-center rounded-2xl bg-card p-5"
          style={{
            boxShadow:
              "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
          }}
        >
          <Image
            src="/oreo.svg"
            alt="Oreo — pixel-art black cat mascot"
            width={80}
            height={80}
            className="h-20 w-20"
            style={{ imageRendering: "pixelated" }}
            priority
          />
        </div>

        <div className="text-center">
          <h1 className="font-heading text-2xl font-semibold text-oreo-slate-purple">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re logged in — the shell is coming in Phase 6
          </p>
        </div>

        {/* User info card */}
        <Card
          className="w-full border-0"
          style={{
            boxShadow:
              "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
          }}
        >
          <CardContent className="flex flex-col gap-4 pt-6 pb-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </span>
              <span className="text-sm font-medium text-foreground">
                {user?.email}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Base Currency
              </span>
              <span className="font-mono text-sm font-medium text-oreo-dusty-teal">
                {profile?.base_currency || "Not set"}
              </span>
            </div>

            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                className="w-full mt-2"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Status badge */}
        <div
          className="flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm text-muted-foreground"
          style={{
            boxShadow:
              "0 2px 12px rgba(86, 86, 118, 0.06), 0 1px 3px rgba(86, 86, 118, 0.03)",
          }}
        >
          <span className="inline-block h-2 w-2 rounded-full bg-oreo-dusty-teal" />
          Phase 5 — authentication complete
        </div>
      </div>
    </div>
  );
}
