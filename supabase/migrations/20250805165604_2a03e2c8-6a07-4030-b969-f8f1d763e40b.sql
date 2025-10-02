-- Add company_id column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN company_id UUID REFERENCES public.company_profile(id);

-- Create index for better performance
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id);