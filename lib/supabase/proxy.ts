import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Creates a Supabase client for use inside the proxy (formerly middleware).
 *
 * The proxy cannot use `cookies()` from `next/headers` — it must manipulate
 * cookies directly on the request/response objects. This helper wires up
 * the cookie bridge between @supabase/ssr and the proxy's request/response.
 *
 * Returns both the Supabase client and the NextResponse so the caller can
 * return the response with updated cookies.
 */
export async function createClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First, set cookies on the request (so downstream server code sees them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Then rebuild the response with the updated request
          supabaseResponse = NextResponse.next({
            request,
          });

          // Finally, set the cookies on the response (so the browser stores them)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response: supabaseResponse };
}
