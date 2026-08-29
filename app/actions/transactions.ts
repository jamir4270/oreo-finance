"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TransactionActionState = {
  error?: string;
  success?: string;
} | null;

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const supabase = await createClient();

  const type = formData.get("type") as string;
  const amountStr = formData.get("amount") as string;
  const account_id = formData.get("account_id") as string;
  const category_id = formData.get("category_id") as string;
  const txn_date = formData.get("txn_date") as string;
  const note = formData.get("note") as string;

  if (!type || !amountStr || !account_id || !category_id || !txn_date) {
    return { error: "Please fill in all required fields." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in to log a transaction." };
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("transactions").insert({
    user_id: userData.user.id,
    type,
    amount,
    account_id,
    category_id,
    txn_date,
    note: note || null,
    client_created_at: now,
    synced_at: now,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/accounts"); // Refresh balances
  return { success: "Transaction logged successfully." };
}

export async function updateTransaction(
  id: string,
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const supabase = await createClient();

  const type = formData.get("type") as string;
  const amountStr = formData.get("amount") as string;
  const account_id = formData.get("account_id") as string;
  const category_id = formData.get("category_id") as string;
  const txn_date = formData.get("txn_date") as string;
  const note = formData.get("note") as string;

  if (!type || !amountStr || !account_id || !category_id || !txn_date) {
    return { error: "Please fill in all required fields." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      account_id,
      category_id,
      txn_date,
      note: note || null,
      updated_at: now,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/accounts"); // Refresh balances
  return { success: "Transaction updated successfully." };
}

export async function deleteTransaction(id: string): Promise<TransactionActionState> {
  const supabase = await createClient();

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/accounts"); // Refresh balances
  return { success: "Transaction deleted successfully." };
}
