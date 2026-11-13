"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Stops a recurring rule. Entries it already created stay (recurring_id becomes null). */
export async function stopRecurring(id: string): Promise<{ error?: string } | null> {
  const supabase = await createClient();
  // RLS limits the delete to the signed-in user's own rules.
  const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return null;
}
