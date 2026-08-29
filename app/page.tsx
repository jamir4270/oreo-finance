import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Root page — redirects to the appropriate destination.
 *
 * - Authenticated users → /dashboard
 * - Unauthenticated users → /login
 *
 * The proxy handles this for most requests, but this catches direct
 * navigation to "/" and ensures a clean redirect.
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
