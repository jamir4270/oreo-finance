"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = {
  error?: string;
} | null;

/**
 * Completes the onboarding step by setting the user's base_currency
 * and marking onboarding as done in user metadata + a cookie.
 */
export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();

  const baseCurrency = formData.get("baseCurrency") as string;

  if (!baseCurrency || baseCurrency.length !== 3) {
    return { error: "Please select a valid currency." };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to complete onboarding." };
  }

  // Update the profile's base_currency
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ base_currency: baseCurrency.toUpperCase() })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Failed to save currency preference. Please try again." };
  }

  // Mark onboarding as complete in user metadata
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { onboarding_complete: true },
  });

  if (metadataError) {
    return { error: "Failed to complete onboarding. Please try again." };
  }

  // Set the onboarding_complete cookie so the proxy doesn't re-check
  const cookieStore = await cookies();
  cookieStore.set("onboarding_complete", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  redirect("/dashboard");
}
