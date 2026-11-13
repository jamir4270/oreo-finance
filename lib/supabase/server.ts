import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers.
 *
 * Uses next/headers cookies() with getAll/setAll for cookie-based session
 * management per @supabase/ssr conventions.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll was called from a Server Component.
            // This can be ignored if proxy is refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * The signed-in user for this request, or null. Deduplicated per request with
 * React cache(), so the layout and page share one check. getClaims() verifies
 * the JWT locally when the project uses asymmetric signing keys (otherwise it
 * falls back to asking the Auth server), unlike getUser() which always does.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;
  return { id: data.claims.sub, email: data.claims.email };
});
