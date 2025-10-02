-- Enable RLS on all remaining tables
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (allowing all operations since no auth is implemented)
CREATE POLICY "Allow all operations on company_profile" 
ON public.company_profile 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on invoices" 
ON public.invoices 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on invoice_items" 
ON public.invoice_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on products" 
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);