-- Create admin_users table for custom authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (allow all operations since this is admin-only)
CREATE POLICY "Allow all operations on admin_users" 
ON public.admin_users 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (password: Admin@2024)
-- Password hash generated using bcrypt with salt rounds 12
INSERT INTO public.admin_users (email, password_hash, name)
VALUES ('admin@invoicehub.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YNu5JUmRJVa7Y8fGY1J4Rf.zQw8w8w8w8w', 'System Administrator');