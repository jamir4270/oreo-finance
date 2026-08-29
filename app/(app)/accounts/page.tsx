import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountsPageClient } from "@/components/accounts/AccountsPageClient";

export default async function AccountsPage() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect("/login");
  }

  // Fetch user's profile for base currency
  const { data: profile } = await supabase
    .from("profiles")
    .select("base_currency")
    .eq("id", userData.user.id)
    .single();

  // Fetch accounts (active and archived)
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, type, currency, icon, archived_at")
    .eq("user_id", userData.user.id)
    .order("name");

  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <AccountsPageClient 
        accounts={accounts || []} 
        baseCurrency={profile?.base_currency || "USD"} 
      />
    </div>
  );
}
