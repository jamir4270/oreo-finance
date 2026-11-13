-- Amount in the user's base currency at the moment the transaction was saved, so history
-- doesn't drift as exchange rates move. Nullable: older rows (and rows whose rate was
-- unavailable) fall back to live conversion in the app.
alter table public.transactions
  add column base_amount numeric,
  add column base_currency text check (base_currency is null or char_length(base_currency) = 3),
  add constraint transactions_base_pair check ((base_amount is null) = (base_currency is null));
