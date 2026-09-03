"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AccountActionState = {
  error?: string;
  success?: string;
} | null;

export async function createAccount(
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const currency = formData.get("currency") as string;
  const icon = formData.get("icon") as string;

  if (!name || !type || !currency) {
    return { error: "Name, type, and currency are required." };
  }

  if (currency.length !== 3) {
    return { error: "Currency must be a 3-letter ISO code." };
  }

  const initialBalanceStr = formData.get("initial_balance") as string;
  const initialBalance = parseFloat(initialBalanceStr);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in to create an account." };
  }

  const { data: newAccount, error } = await supabase.from("accounts").insert({
    user_id: userData.user.id,
    name,
    type,
    currency,
    icon: icon || null,
  }).select().single();

  if (error) {
    return { error: error.message };
  }

  // Handle Initial Balance
  if (!isNaN(initialBalance) && initialBalance > 0 && newAccount) {
    // Find an income category to use for the initial balance
    const { data: incomeCategories } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("txn_type", "income")
      .limit(1);

    if (incomeCategories && incomeCategories.length > 0) {
      const now = new Date().toISOString();
      await supabase.from("transactions").insert({
        user_id: userData.user.id,
        type: "income",
        amount: initialBalance,
        account_id: newAccount.id,
        category_id: incomeCategories[0].id,
        txn_date: now.split("T")[0],
        note: "Initial Balance",
        client_created_at: now,
        synced_at: now,
      });
    }
  }

  revalidatePath("/accounts");
  return { success: "Account created successfully." };
}

export async function updateAccount(
  id: string,
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const icon = formData.get("icon") as string;

  if (!name || !type) {
    return { error: "Name and type are required." };
  }

  // Note: currency is intentionally omitted from the update payload to enforce immutability (FR-2.2).
  const { error } = await supabase
    .from("accounts")
    .update({
      name,
      type,
      icon: icon || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/accounts");
  return { success: "Account updated successfully." };
}

export async function archiveAccount(id: string): Promise<AccountActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("accounts")
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/accounts");
  return { success: "Account archived successfully." };
}

export async function restoreAccount(id: string): Promise<AccountActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("accounts")
    .update({
      archived_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/accounts");
  return { success: "Account restored successfully." };
}
