import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Protected route group layout.
 *
 * Performs a server-side session check as a defense-in-depth measure
 * alongside the proxy's route protection. If the user somehow reaches
 * a protected page without a valid session, redirect to login.
 *
 * Phase 6 will add the full navigation shell (sidebar + bottom nav) here.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  );
}
