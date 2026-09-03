"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type BudgetActionState = {
  error?: string;
  success?: string;
} | null;

export async function createBudget(
  _prevState: BudgetActionState,
  formData: FormData
): Promise<BudgetActionState> {
  const supabase = await createClient();

  const category_id = formData.get("category_id") as string;
  const limitStr = formData.get("limit_amount") as string;
  const period_type = formData.get("period_type") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string | null;

  if (!category_id || !limitStr || !period_type || !start_date) {
    return { error: "Please fill in all required fields." };
  }

  if (period_type === "custom" && !end_date) {
    return { error: "End date is required for custom period budgets." };
  }

  const limit_amount = parseFloat(limitStr);
  if (isNaN(limit_amount) || limit_amount <= 0) {
    return { error: "Limit amount must be greater than zero." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in to create a budget." };
  }

  // Check for existing budget on this category
  const { data: existingBudget } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("category_id", category_id)
    .limit(1)
    .single();

  if (existingBudget) {
    return { error: "A budget already exists for this category. Edit or delete the existing one first." };
  }

  // Insert budget
  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .insert({
      user_id: userData.user.id,
      category_id,
      limit_amount,
      period_type,
      start_date,
      end_date: period_type === "custom" ? end_date : null,
    })
    .select()
    .single();

  if (budgetError) {
    return { error: budgetError.message };
  }

  // Create initial budget_periods row
  const { computePeriodBounds } = await import("@/lib/budget-periods");
  const { periodStart, periodEnd } = computePeriodBounds(
    { period_type, start_date, end_date: period_type === "custom" ? end_date : null },
    new Date()
  );

  const { error: periodError } = await supabase.from("budget_periods").insert({
    user_id: userData.user.id,
    budget_id: budget.id,
    period_start: periodStart,
    period_end: periodEnd,
    base_limit: limit_amount,
    rollover_in: 0,
    effective_limit: limit_amount,
    actual_spent: 0,
  });

  if (periodError) {
    return { error: periodError.message };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: "Budget created successfully." };
}

export async function updateBudget(
  id: string,
  _prevState: BudgetActionState,
  formData: FormData
): Promise<BudgetActionState> {
  const supabase = await createClient();

  const limitStr = formData.get("limit_amount") as string;
  const period_type = formData.get("period_type") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string | null;

  if (!limitStr || !period_type || !start_date) {
    return { error: "Please fill in all required fields." };
  }

  if (period_type === "custom" && !end_date) {
    return { error: "End date is required for custom period budgets." };
  }

  const limit_amount = parseFloat(limitStr);
  if (isNaN(limit_amount) || limit_amount <= 0) {
    return { error: "Limit amount must be greater than zero." };
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("budgets")
    .update({
      limit_amount,
      period_type,
      start_date,
      end_date: period_type === "custom" ? end_date : null,
      updated_at: now,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: "Budget updated successfully." };
}

export async function deleteBudget(id: string): Promise<BudgetActionState> {
  const supabase = await createClient();

  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: "Budget deleted successfully." };
}
