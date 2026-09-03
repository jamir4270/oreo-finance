import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/proxy";

/**
 * Route-protection proxy (Next.js 16 convention — replaces deprecated middleware.ts).
 *
 * Responsibilities:
 *  1. Refresh the Supabase auth session on every request (keeps cookies fresh)
 *  2. Redirect unauthenticated users away from protected routes → /login
 *  3. Redirect authenticated users away from auth pages → /dashboard
 *  4. Redirect newly signed-up users to /onboarding if they haven't completed it
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = await createClient(request);

  // Refresh session — IMPORTANT: use getUser() not getSession() for security.
  // getUser() contacts the Supabase Auth server to validate the token,
  // while getSession() only reads from local storage and can be tampered with.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public auth routes that don't require a session (guests only)
  const authRoutes = ["/login", "/signup", "/reset-password"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Auth callback must always pass through
  if (pathname.startsWith("/auth/callback")) {
    return response;
  }

  // Unauthenticated user trying to access a protected route → redirect to login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return Response.redirect(url);
  }

  // Authenticated user visiting an auth route → redirect to dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return Response.redirect(url);
  }

  // Authenticated user — check if onboarding is complete
  if (
    user &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/update-password")
  ) {
    const onboardingComplete = request.cookies.get("onboarding_complete");
    if (!onboardingComplete) {
      // Check the database to see if the user has completed onboarding
      // (i.e., they've explicitly set their base_currency at least once)
      const { data: profile } = await supabase
        .from("profiles")
        .select("base_currency")
        .eq("id", user.id)
        .single();

      // If profile exists and user metadata indicates onboarding is done, set cookie
      if (profile && user.user_metadata?.onboarding_complete) {
        response.cookies.set("onboarding_complete", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      } else if (profile && !user.user_metadata?.onboarding_complete) {
        // User hasn't completed onboarding — redirect
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return Response.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets (images, SVGs)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sw.js|offline.html|manifest.json|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
