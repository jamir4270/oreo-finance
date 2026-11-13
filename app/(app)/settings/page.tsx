import { redirect } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { PageTitle } from "@/components/layout/nav-title";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  const supabase = await createClient();

  // Get user profile for base currency
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("base_currency")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  return (
    <PageTransition>
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2 border-b border-border pb-6 mb-8">
        <PageTitle>Settings</PageTitle>
        <p className="text-sm text-muted-foreground">
          Manage your account, preferences, and base currency.
        </p>
      </div>

      <SettingsClient
        email={user.email ?? "No email found"}
        baseCurrency={profile?.base_currency ?? "USD"}
      />
    </div>
    </PageTransition>
  );
}
