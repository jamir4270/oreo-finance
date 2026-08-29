import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Protected route group layout.
 *
 * Performs a server-side session check as a defense-in-depth measure
 * alongside the proxy's route protection. If the user somehow reaches
 * a protected page without a valid session, redirect to login.
 *
 * Provides the main App Shell (sidebar + bottom nav).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
