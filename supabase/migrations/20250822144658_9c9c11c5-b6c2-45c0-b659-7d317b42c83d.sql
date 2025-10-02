-- Add stamp_url column to company_profile table for company stamp/seal
ALTER TABLE public.company_profile 
ADD COLUMN stamp_url text;