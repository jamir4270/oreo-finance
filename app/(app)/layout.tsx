import { redirect } from "next/navigation";
import { syncRecurring } from "@/lib/recurring";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { getToday } from "@/lib/today";

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
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  const supabase = await createClient();
  await syncRecurring(); // create any due recurring entries before reading

  const today = await getToday();
  // Accounts and categories feed the global Add Transaction modal
  const [{ data: accounts }, { data: categories }, { count: dailyTxnCount }] = await Promise.all([
    supabase.from("accounts").select("id, name, currency").eq("user_id", user.id).order("name"),
    supabase.from("categories").select("id, name, icon, txn_type").eq("user_id", user.id).order("name"),
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("txn_date", today),
  ]);

  return (
    <AppShell accounts={accounts || []} categories={categories || []} dailyTxnCount={dailyTxnCount || 0}>
      {children}
    </AppShell>
  );
}
