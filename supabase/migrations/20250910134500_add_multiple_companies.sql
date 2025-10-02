CREATE TABLE IF NOT EXISTS public.company_profile (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name text NOT NULL,
    address text,
    city text,
    state text,
    pin_code text,
    phone text,
    email text,
    website text,
    logo_url text,
    stamp_url text,
    gstin text,
    pan text,
    bank_name text,
    bank_account_number text,
    bank_ifsc text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_company_profile_company_name ON public.company_profile (company_name);
CREATE INDEX IF NOT EXISTS idx_company_profile_created_at ON public.company_profile (created_at);
CREATE INDEX IF NOT EXISTS idx_company_profile_gstin ON public.company_profile (gstin);

-- Add foreign key to invoices table
ALTER TABLE IF EXISTS public.invoices
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.company_profile(id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.company_profile
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.company_profile
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.company_profile
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.company_profile
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add triggers for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_company_profile_updated_at ON public.company_profile;
CREATE TRIGGER set_company_profile_updated_at
  BEFORE UPDATE ON public.company_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
