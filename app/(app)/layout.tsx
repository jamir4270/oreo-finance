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

  // Fetch accounts and categories for the global Add Transaction modal
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, currency")
    .eq("user_id", user.id)
    .order("name");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, icon, txn_type")
    .eq("user_id", user.id)
    .order("name");

  return (
    <AppShell accounts={accounts || []} categories={categories || []}>
      {children}
    </AppShell>
  );
}
