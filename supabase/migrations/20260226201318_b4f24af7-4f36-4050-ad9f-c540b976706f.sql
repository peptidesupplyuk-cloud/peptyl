ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_verify_code TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_verify_expires_at TIMESTAMPTZ;