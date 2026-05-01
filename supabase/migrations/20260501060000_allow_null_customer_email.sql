-- Support checkout flow without collecting customer email
-- Some deployed databases still have orders.customer_email as NOT NULL.

DO $$
BEGIN
  -- Add the column if it does not exist (for schema drift safety).
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN customer_email TEXT;
  END IF;
END
$$;

-- Allow null values since email is no longer required in checkout.
ALTER TABLE public.orders
  ALTER COLUMN customer_email DROP NOT NULL;
