create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, base_currency)
  values (new.id, 'PHP');

  insert into public.categories (user_id, name, txn_type, icon, is_default) values
    (new.id, 'Groceries', 'expense', 'shopping-cart', true),
    (new.id, 'Transport', 'expense', 'car', true),
    (new.id, 'Salary', 'income', 'wallet', true);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();