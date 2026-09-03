import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

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
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2 border-b border-border pb-6 mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-oreo-slate-purple">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, preferences, and base currency.
        </p>
      </div>

      <SettingsClient
        email={user.email ?? "No email found"}
        baseCurrency={profile?.base_currency ?? "USD"}
      />
    </div>
  );
}
