ALTER TABLE "public"."budgets" DROP CONSTRAINT "budgets_period_type_check";
ALTER TABLE "public"."budgets" ADD CONSTRAINT "budgets_period_type_check" CHECK (period_type IN ('daily', 'weekly', 'monthly', 'custom'));
