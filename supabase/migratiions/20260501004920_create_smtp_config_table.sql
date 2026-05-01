/*
  # Create SMTP configuration table

  1. New Tables
    - `smtp_config`
      - `id` (int, primary key)
      - `smtp_host` (text, default 'smtp.gmail.com')
      - `smtp_port` (int, default 587)
      - `smtp_user` (text, sender email)
      - `smtp_pass` (text, app password)
      - `recipient_email` (text, order receiver email)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `smtp_config` table
    - No public access - only service role can read/write
    - Insert default config row with provided credentials

  3. Notes
    - This table stores the SMTP credentials used by the send-order-email edge function
    - Only the service role key (used by edge functions) can access this data
    - No client-side access is permitted
*/

CREATE TABLE IF NOT EXISTS smtp_config (
  id int PRIMARY KEY DEFAULT 1,
  smtp_host text DEFAULT 'smtp.gmail.com',
  smtp_port int DEFAULT 587,
  smtp_user text NOT NULL,
  smtp_pass text NOT NULL,
  recipient_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE smtp_config ENABLE ROW LEVEL SECURITY;

-- No policies for authenticated or anon users - only service role can access
-- Service role bypasses RLS by default

-- Insert the SMTP configuration
INSERT INTO smtp_config (smtp_user, smtp_pass, recipient_email)
VALUES (
  'spencer.mail.services@gmail.com',
  'mtra vkgu vers kopx',
  'marksspe.20@gmail.com'
);
