-- Add currency column to budgets table
-- Pins each budget to the base_currency at creation time, so currency
-- switches in settings don't silently corrupt budget limits.

ALTER TABLE budgets ADD COLUMN currency text NOT NULL DEFAULT 'PHP';

-- Backfill existing rows with each user's current base_currency
UPDATE budgets
SET currency = profiles.base_currency
FROM profiles
WHERE budgets.user_id = profiles.id;

-- Add validation constraint (matches accounts.currency pattern)
ALTER TABLE budgets ADD CONSTRAINT budgets_currency_len CHECK (char_length(currency) = 3);
