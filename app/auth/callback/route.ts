import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback route handler.
 *
 * Handles the redirect from Supabase Auth after:
 *  - Email confirmation (sign-up)
 *  - Password reset link
 *  - OAuth callbacks (future)
 *
 * Exchanges the auth code for a session and redirects the user
 * to the appropriate destination.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For password reset flows, redirect to the update-password page
      // For normal sign-in/confirmation, redirect to dashboard (or onboarding)
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error("[Auth Callback] Error exchanging code for session:", error);
    }
  }

  // If code exchange fails or no code provided, redirect to an error page
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
