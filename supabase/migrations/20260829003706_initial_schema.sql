-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  base_currency text not null check (char_length(base_currency) = 3),
  reminder_time time,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- accounts
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('cash','savings','e_wallet','custom')),
  currency text not null check (char_length(currency) = 3),
  icon text,
  color text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_accounts_user on accounts(user_id);
create index idx_accounts_user_archived on accounts(user_id, archived_at);

-- categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  txn_type text not null check (txn_type in ('expense','income','transfer')),
  icon text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_categories_user on categories(user_id);
create index idx_categories_user_type on categories(user_id, txn_type);

-- transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('expense','income','transfer')),
  account_id uuid not null references accounts(id) on delete restrict,
  to_account_id uuid references accounts(id) on delete restrict,
  category_id uuid not null references categories(id) on delete restrict,
  amount numeric not null check (amount > 0),
  to_amount numeric check (to_amount is null or to_amount > 0),
  exchange_rate numeric,
  txn_date date not null,
  note text,
  client_created_at timestamptz not null,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((type = 'transfer') = (to_account_id is not null)),
  check (to_account_id is null or to_account_id != account_id)
);
create index idx_txn_user on transactions(user_id);
create index idx_txn_account on transactions(account_id);
create index idx_txn_to_account on transactions(to_account_id);
create index idx_txn_category on transactions(category_id);
create index idx_txn_user_date on transactions(user_id, txn_date);

-- goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  target_date date,
  created_at timestamptz not null default now()
);
create index idx_goals_user on goals(user_id);

-- goal_contributions
create table goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  goal_id uuid not null references goals(id) on delete cascade,
  transaction_id uuid not null references transactions(id) on delete cascade,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index idx_gc_user on goal_contributions(user_id);
create index idx_gc_goal on goal_contributions(goal_id);
create index idx_gc_txn on goal_contributions(transaction_id);

-- budgets
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  limit_amount numeric not null check (limit_amount > 0),
  period_type text not null check (period_type in ('weekly','monthly','custom')),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((period_type = 'custom') = (end_date is not null))
);
create index idx_budgets_user on budgets(user_id);
create index idx_budgets_category on budgets(category_id);

-- budget_periods
create table budget_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  budget_id uuid not null references budgets(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  base_limit numeric not null,
  rollover_in numeric not null default 0,
  effective_limit numeric not null,
  actual_spent numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (budget_id, period_start)
);
create index idx_bp_user on budget_periods(user_id);
create index idx_bp_budget on budget_periods(budget_id);

-- exchange_rates
create table exchange_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null default 'USD',
  rates jsonb not null,
  fetched_at timestamptz not null default now()
);
create index idx_rates_fetched on exchange_rates(fetched_at desc);