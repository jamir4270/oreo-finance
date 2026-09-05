"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getExchangeRates } from "@/lib/exchange-rates";
import { convertCurrency } from "@/lib/currency";

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

  const to_account_id = formData.get("to_account_id") as string | null;

  if (!type || !amountStr || !account_id || !category_id || !txn_date) {
    return { error: "Please fill in all required fields." };
  }

  if (type === "transfer" && !to_account_id) {
    return { error: "Destination account is required for transfers." };
  }

  if (type === "transfer" && account_id === to_account_id) {
    return { error: "Source and destination accounts must be different." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in to log a transaction." };
  }

  // Handle cross-currency transfers
  let to_amount: number | null = null;
  let exchange_rate: number | null = null;

  if (type === "transfer" && to_account_id) {
    // Fetch source and destination account currencies
    const { data: accountsData } = await supabase
      .from("accounts")
      .select("id, currency")
      .in("id", [account_id, to_account_id]);

    const sourceAccount = accountsData?.find((a) => a.id === account_id);
    const destAccount = accountsData?.find((a) => a.id === to_account_id);

    if (!sourceAccount || !destAccount) {
      return { error: "Could not fetch account details for transfer." };
    }

    if (sourceAccount.currency !== destAccount.currency) {
      const { rates } = await getExchangeRates();
      to_amount = convertCurrency(amount, sourceAccount.currency, destAccount.currency, rates);
      // Determine the exchange rate applied
      exchange_rate = rates[destAccount.currency] / rates[sourceAccount.currency];
    } else {
      to_amount = amount;
      exchange_rate = 1.0;
    }
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("transactions").insert({
    user_id: userData.user.id,
    type,
    amount,
    to_account_id: type === "transfer" ? to_account_id : null,
    to_amount,
    exchange_rate,
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
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  if (type === "expense") {
    revalidatePath("/analytics");
    revalidatePath("/budgets");
  }
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

  const to_account_id = formData.get("to_account_id") as string | null;

  if (!type || !amountStr || !account_id || !category_id || !txn_date) {
    return { error: "Please fill in all required fields." };
  }

  if (type === "transfer" && !to_account_id) {
    return { error: "Destination account is required for transfers." };
  }

  if (type === "transfer" && account_id === to_account_id) {
    return { error: "Source and destination accounts must be different." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  // Handle cross-currency transfers
  let to_amount: number | null = null;
  let exchange_rate: number | null = null;

  if (type === "transfer" && to_account_id) {
    // Fetch source and destination account currencies
    const { data: accountsData } = await supabase
      .from("accounts")
      .select("id, currency")
      .in("id", [account_id, to_account_id]);

    const sourceAccount = accountsData?.find((a) => a.id === account_id);
    const destAccount = accountsData?.find((a) => a.id === to_account_id);

    if (!sourceAccount || !destAccount) {
      return { error: "Could not fetch account details for transfer." };
    }

    if (sourceAccount.currency !== destAccount.currency) {
      const { rates } = await getExchangeRates();
      to_amount = convertCurrency(amount, sourceAccount.currency, destAccount.currency, rates);
      exchange_rate = rates[destAccount.currency] / rates[sourceAccount.currency];
    } else {
      to_amount = amount;
      exchange_rate = 1.0;
    }
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      to_account_id: type === "transfer" ? to_account_id : null,
      to_amount: type === "transfer" ? to_amount : null,
      exchange_rate: type === "transfer" ? exchange_rate : null,
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
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  if (type === "expense") {
    revalidatePath("/analytics");
    revalidatePath("/budgets");
  }
  return { success: "Transaction updated successfully." };
}

export async function deleteTransaction(id: string): Promise<TransactionActionState> {
  const supabase = await createClient();

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/budgets");
  return { success: "Transaction deleted successfully." };
}
