-- Add new columns to company_profile table if they do not exist
ALTER TABLE public.company_profile
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS pin_code text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS pin_code text;

