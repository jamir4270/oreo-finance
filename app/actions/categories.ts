"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CategoryActionState = {
  error?: string;
  success?: string;
} | null;

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const txn_type = formData.get("txn_type") as string;
  const icon = formData.get("icon") as string;

  if (!name || !txn_type || !icon) {
    return { error: "Name, transaction type, and icon are required." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in to create a category." };
  }

  const { error } = await supabase.from("categories").insert({
    user_id: userData.user.id,
    name,
    txn_type,
    icon,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/categories");
  return { success: "Category created successfully." };
}

export async function updateCategory(
  id: string,
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string;

  if (!name || !icon) {
    return { error: "Name and icon are required." };
  }

  // Note: txn_type is intentionally omitted to enforce immutability
  const { error } = await supabase
    .from("categories")
    .update({
      name,
      icon,
      // No updated_at in schema, wait, let me check database-schema.md
      // Actually schema says created_at, let me check if we need to update a timestamp.
      // Line 115 says `created_at` but no `updated_at`. So just updating name and icon is fine.
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/categories");
  return { success: "Category updated successfully." };
}

export async function deleteCategory(id: string): Promise<CategoryActionState> {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    // Postgres error code 23503 is foreign_key_violation
    if (error.code === "23503") {
      return { error: "Category cannot be deleted because it is used in one or more transactions." };
    }
    return { error: error.message };
  }

  revalidatePath("/categories");
  return { success: "Category deleted successfully." };
}
