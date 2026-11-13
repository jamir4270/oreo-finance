-- Repeating transactions (allowance, rent, subscriptions). Due occurrences are created
-- lazily when the user opens the app (lib/recurring.ts), so no cron is needed.
create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('expense', 'income')),
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount numeric not null check (amount > 0), -- in the account's currency
  note text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date not null,
  next_date date not null,
  end_date date,
  created_at timestamptz not null default now()
);
create index idx_recurring_due on public.recurring_transactions (user_id, next_date);

alter table public.recurring_transactions enable row level security;
create policy "own recurring_transactions" on public.recurring_transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Each generated transaction points at its rule; stopping a rule keeps past entries.
alter table public.transactions
  add column recurring_id uuid references public.recurring_transactions(id) on delete set null;
-- One entry per rule per day, so concurrent requests can't double-create
-- (NULLs are distinct, so ordinary transactions are unaffected).
alter table public.transactions
  add constraint transactions_recurring_once unique (recurring_id, txn_date);
