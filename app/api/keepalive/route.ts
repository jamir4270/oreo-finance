import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    // Run a trivial query to keep the database awake
    await supabase.from("profiles").select("id").limit(1);
    return NextResponse.json({ status: "ok", message: "Database is awake" });
  } catch (error) {
    console.error("Keepalive ping failed:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to ping database" },
      { status: 500 }
    );
  }
}
