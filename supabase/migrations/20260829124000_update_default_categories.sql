-- 1. Replace the trigger function for future users
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, base_currency)
  values (new.id, 'PHP');

  insert into public.categories (user_id, name, txn_type, icon, is_default) values
    -- Expense
    (new.id, 'Groceries', 'expense', 'ShoppingCart', true),
    (new.id, 'Transport', 'expense', 'Car', true),
    (new.id, 'Dining', 'expense', 'Utensils', true),
    (new.id, 'Utilities', 'expense', 'Zap', true),
    (new.id, 'Entertainment', 'expense', 'Film', true),
    (new.id, 'Health', 'expense', 'Stethoscope', true),
    (new.id, 'Shopping', 'expense', 'Shirt', true),
    
    -- Income
    (new.id, 'Salary', 'income', 'Banknote', true),
    (new.id, 'Investments', 'income', 'TrendingUp', true),
    (new.id, 'Gifts', 'income', 'Gift', true),
    (new.id, 'Allowance', 'income', 'PiggyBank', true),

    -- Transfer
    (new.id, 'Transfer', 'transfer', 'Droplet', true);

  return new;
end;
$$ language plpgsql security definer;

-- 2. Retroactively apply to existing users (like the current test account)
-- First, safely remove the old placeholders
DELETE FROM public.categories WHERE is_default = true;

-- Then insert the new finalized list for all existing users
INSERT INTO public.categories (user_id, name, txn_type, icon, is_default)
SELECT u.id, c.name, c.txn_type, c.icon, c.is_default
FROM auth.users u
CROSS JOIN (
  VALUES
    ('Groceries', 'expense', 'ShoppingCart', true),
    ('Transport', 'expense', 'Car', true),
    ('Dining', 'expense', 'Utensils', true),
    ('Utilities', 'expense', 'Zap', true),
    ('Entertainment', 'expense', 'Film', true),
    ('Health', 'expense', 'Stethoscope', true),
    ('Shopping', 'expense', 'Shirt', true),
    ('Salary', 'income', 'Banknote', true),
    ('Investments', 'income', 'TrendingUp', true),
    ('Gifts', 'income', 'Gift', true),
    ('Allowance', 'income', 'PiggyBank', true),
    ('Transfer', 'transfer', 'Droplet', true)
) AS c(name, txn_type, icon, is_default);
