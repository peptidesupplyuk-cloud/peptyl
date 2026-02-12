
-- Add notification preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notify_email boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_whatsapp boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS notify_am_time time NOT NULL DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS notify_pm_time time NOT NULL DEFAULT '20:00';
