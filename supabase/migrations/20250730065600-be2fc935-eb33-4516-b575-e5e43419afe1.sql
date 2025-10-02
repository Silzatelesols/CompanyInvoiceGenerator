-- Enable RLS on company_profile table for security
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow full access (single-user application scenario)
-- In a real multi-user app, you'd restrict by user_id
CREATE POLICY "Allow all operations on company_profile" 
ON public.company_profile 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates on company_profile
CREATE TRIGGER update_company_profile_updated_at
BEFORE UPDATE ON public.company_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on clients table for security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for clients table
CREATE POLICY "Allow all operations on clients" 
ON public.clients 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates on clients
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on products table for security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for products table
CREATE POLICY "Allow all operations on products" 
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on invoices table for security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for invoices table
CREATE POLICY "Allow all operations on invoices" 
ON public.invoices 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates on invoices
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on invoice_items table for security
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for invoice_items table
CREATE POLICY "Allow all operations on invoice_items" 
ON public.invoice_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates on invoice_items
CREATE TRIGGER update_invoice_items_updated_at
BEFORE UPDATE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();