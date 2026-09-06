ALTER TABLE "public"."transactions"
ADD COLUMN "original_amount" numeric NULL,
ADD COLUMN "original_currency" text NULL CHECK (char_length(original_currency) = 3);
