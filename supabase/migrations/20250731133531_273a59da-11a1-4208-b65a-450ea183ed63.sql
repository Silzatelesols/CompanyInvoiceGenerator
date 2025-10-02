-- Enable Row Level Security on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table (allowing all operations for now since no auth is implemented)
CREATE POLICY "Allow all operations on clients" 
ON public.clients 
FOR ALL 
USING (true) 
WITH CHECK (true);