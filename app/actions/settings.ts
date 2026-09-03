"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  error?: string;
  success?: string;
} | null;

/**
 * Updates the user's base currency setting.
 */
export async function updateBaseCurrency(
  currency: string
): Promise<ActionState> {
  if (!currency || currency.length !== 3) {
    return { error: "Please select a valid currency." };
  }

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to change settings." };
  }

  // Update the profile's base_currency
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ base_currency: currency.toUpperCase() })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Failed to save currency preference. Please try again." };
  }

  // Revalidate routes that depend on base currency
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/settings");

  return { success: "Base currency updated successfully." };
}
