-- SMTP config compatibility migration (no hardcoded secrets)

CREATE TABLE IF NOT EXISTS public.smtp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL DEFAULT 'smtp.gmail.com',
  port INTEGER NOT NULL DEFAULT 587,
  secure BOOLEAN NOT NULL DEFAULT FALSE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT DEFAULT 'Manuel''s Closet',
  recipient_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward-compat columns in case an older schema already exists.
ALTER TABLE public.smtp_config ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE public.smtp_config ADD COLUMN IF NOT EXISTS smtp_port INTEGER;
ALTER TABLE public.smtp_config ADD COLUMN IF NOT EXISTS smtp_user TEXT;
ALTER TABLE public.smtp_config ADD COLUMN IF NOT EXISTS smtp_pass TEXT;

ALTER TABLE public.smtp_config ENABLE ROW LEVEL SECURITY;

-- No seeded credentials here.
-- Insert SMTP credentials manually in Supabase Dashboard (or via secure SQL).
