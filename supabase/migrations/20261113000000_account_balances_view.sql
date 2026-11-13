-- Per-account balance, computed in Postgres instead of shipping every transaction to the app.
-- security_invoker: the caller's RLS on accounts/transactions applies, so users only see their own rows.
create or replace view public.account_balances
with (security_invoker = true) as
select
  a.id as account_id,
  a.user_id,
  coalesce(o.income, 0) as income,
  coalesce(o.expense, 0) as expense,
  coalesce(o.income, 0) - coalesce(o.expense, 0) - coalesce(o.transfer_out, 0) + coalesce(i.transfer_in, 0) as balance
from public.accounts a
left join (
  select
    account_id,
    sum(amount) filter (where type = 'income') as income,
    sum(amount) filter (where type = 'expense') as expense,
    sum(amount) filter (where type = 'transfer') as transfer_out
  from public.transactions
  group by account_id
) o on o.account_id = a.id
left join (
  select to_account_id, sum(to_amount) as transfer_in
  from public.transactions
  where type = 'transfer'
  group by to_account_id
) i on i.to_account_id = a.id;

revoke all on public.account_balances from anon;
grant select on public.account_balances to authenticated;
