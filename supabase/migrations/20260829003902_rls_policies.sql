alter table profiles enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table goal_contributions enable row level security;
alter table budgets enable row level security;
alter table budget_periods enable row level security;
alter table exchange_rates enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid());
create policy "update own profile" on profiles for update using (id = auth.uid());

create policy "own accounts" on accounts for all using (user_id = auth.uid());
create policy "own categories" on categories for all using (user_id = auth.uid());
create policy "own transactions" on transactions for all using (user_id = auth.uid());
create policy "own goals" on goals for all using (user_id = auth.uid());
create policy "own goal_contributions" on goal_contributions for all using (user_id = auth.uid());
create policy "own budgets" on budgets for all using (user_id = auth.uid());
create policy "own budget_periods" on budget_periods for all using (user_id = auth.uid());

create policy "read rates" on exchange_rates for select using (auth.role() = 'authenticated');