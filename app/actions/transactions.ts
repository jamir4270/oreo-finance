"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getExchangeRates } from "@/lib/exchange-rates";
import { tryConvertCurrency, roundToCurrency } from "@/lib/currency";

export type TransactionActionState = {
  error?: string;
  success?: string;
  warning?: string;
} | null;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const rateUnavailable = (from: string, to: string) =>
  `We couldn't get a ${from} → ${to} exchange rate right now, so this wasn't saved. Try again shortly, or enter the amount in the account's currency.`;

/** Validates the form and converts amounts into the accounts' currencies. Shared by create and update. */
async function parseTransactionForm(supabase: SupabaseServerClient, formData: FormData) {
  const type = formData.get("type") as string;
  const inputAmountStr = ((formData.get("input_amount") as string) || "").trim();
  const inputCurrency = formData.get("input_currency") as string;
  const account_id = formData.get("account_id") as string;
  const category_id = formData.get("category_id") as string;
  const txn_date = formData.get("txn_date") as string;
  const note = formData.get("note") as string;
  const to_account_id = formData.get("to_account_id") as string | null;

  if (!type || !inputAmountStr || !account_id || !category_id || !txn_date) {
    return { error: "Please fill in all required fields." } as const;
  }

  if (type === "transfer" && !to_account_id) {
    return { error: "Destination account is required for transfers." } as const;
  }

  if (type === "transfer" && account_id === to_account_id) {
    return { error: "Source and destination accounts must be different." } as const;
  }

  // Plain decimals only: parseFloat alone would accept "1e3" or "12abc".
  const inputAmount = /^(\d+\.?\d*|\.\d+)$/.test(inputAmountStr) ? Number(inputAmountStr) : NaN;
  if (isNaN(inputAmount) || inputAmount <= 0) {
    return { error: "Amount must be greater than zero." } as const;
  }

  // Fetch account currencies and the user's base currency (for the base_amount snapshot)
  const [{ data: accountsData }, { data: profile }] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, currency")
      .in("id", to_account_id ? [account_id, to_account_id] : [account_id]),
    supabase.from("profiles").select("base_currency").single(),
  ]);

  const sourceAccount = accountsData?.find((a) => a.id === account_id);
  const destAccount = accountsData?.find((a) => a.id === to_account_id);

  if (!sourceAccount) {
    return { error: "Could not fetch source account details." } as const;
  }

  let amount = inputAmount;
  let original_amount: number | null = null;
  let original_currency: string | null = null;

  if (inputCurrency && inputCurrency !== sourceAccount.currency) {
    const { rates } = await getExchangeRates();
    const converted = tryConvertCurrency(inputAmount, inputCurrency, sourceAccount.currency, rates);
    if (converted === null) {
      return { error: rateUnavailable(inputCurrency, sourceAccount.currency) } as const;
    }
    amount = converted;
    original_amount = inputAmount;
    original_currency = inputCurrency;
  }
  amount = roundToCurrency(amount, sourceAccount.currency);
  if (amount <= 0) {
    return { error: "Amount is too small for this account's currency." } as const;
  }

  // Handle cross-currency transfers
  let to_amount: number | null = null;
  let exchange_rate: number | null = null;

  if (type === "transfer" && to_account_id) {
    if (!destAccount) {
      return { error: "Could not fetch destination account details for transfer." } as const;
    }

    if (sourceAccount.currency !== destAccount.currency) {
      const { rates } = await getExchangeRates();
      const converted = tryConvertCurrency(amount, sourceAccount.currency, destAccount.currency, rates);
      if (converted === null) {
        return { error: rateUnavailable(sourceAccount.currency, destAccount.currency) } as const;
      }
      to_amount = roundToCurrency(converted, destAccount.currency);
      exchange_rate = rates[destAccount.currency] / rates[sourceAccount.currency];
    } else {
      to_amount = amount;
      exchange_rate = 1.0;
    }
  }

  // Freeze the base-currency value at today's rate so history doesn't drift. If the rate
  // is unavailable, leave it null: reads fall back to live conversion.
  const base_currency: string | null = profile?.base_currency ?? null;
  let base_amount: number | null = null;
  if (base_currency) {
    const rates = sourceAccount.currency === base_currency ? {} : (await getExchangeRates()).rates;
    const converted = tryConvertCurrency(amount, sourceAccount.currency, base_currency, rates);
    base_amount = converted === null ? null : roundToCurrency(converted, base_currency);
  }

  return {
    fields: {
      type,
      amount,
      base_amount,
      base_currency: base_amount === null ? null : base_currency,
      to_account_id: type === "transfer" ? to_account_id : null,
      to_amount,
      exchange_rate,
      original_amount,
      original_currency,
      account_id,
      category_id,
      txn_date,
      note: note || null,
    },
  } as const;
}

function revalidateTransactionPaths(type: string) {
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  if (type === "expense") {
    revalidatePath("/analytics");
    revalidatePath("/budgets");
  }
}

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const supabase = await createClient();

  const parsed = await parseTransactionForm(supabase, formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in to log a transaction." };
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("transactions").insert({
    user_id: userData.user.id,
    ...fields,
    client_created_at: now,
    synced_at: now,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateTransactionPaths(fields.type);

  // Non-blocking overdraft warning for expenses
  let warning: string | undefined;
  if (fields.type === "expense") {
    try {
      const [{ data: account }, { data: row }] = await Promise.all([
        supabase.from("accounts").select("name").eq("id", fields.account_id).single(),
        supabase.from("account_balances").select("balance").eq("account_id", fields.account_id).single(),
      ]);
      const balance = Number(row?.balance ?? 0);

      if (balance < 0) {
        const accountName = account?.name || "account";
        warning = `This expense brought your ${accountName} balance below zero.`;
      }
    } catch {
      // Silently ignore — overdraft check is best-effort
    }
  }

  return { success: "Transaction logged successfully.", warning };
}

export async function updateTransaction(
  id: string,
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const supabase = await createClient();

  const parsed = await parseTransactionForm(supabase, formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const { error } = await supabase
    .from("transactions")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTransactionPaths(fields.type);
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
