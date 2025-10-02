-- Add settings table for application configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  
  -- Feature toggles
  enable_s3_upload BOOLEAN DEFAULT true,
  enable_email_notifications BOOLEAN DEFAULT true,
  enable_default_template_button BOOLEAN DEFAULT false,
  
  -- Theme settings
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  
  -- Default template
  default_template_id VARCHAR(50) DEFAULT 'modern',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one settings record per user
  UNIQUE(user_id)
);

-- -- Add tags and comments to company_profile table
-- ALTER TABLE public.company_profile
-- ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
-- ADD COLUMN IF NOT EXISTS comments TEXT;

-- -- Create index on tags for faster searching
-- CREATE INDEX IF NOT EXISTS idx_company_profile_tags ON public.company_profile USING GIN(tags);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for existing users
INSERT INTO public.app_settings (user_id, enable_s3_upload, enable_email_notifications, enable_default_template_button, theme, default_template_id)
SELECT id, true, true, false, 'light', 'modern'
FROM public.admin_users
ON CONFLICT (user_id) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.app_settings IS 'Application settings and feature toggles per user';
COMMENT ON COLUMN public.app_settings.enable_s3_upload IS 'Enable/disable S3 upload for PDFs and images';
COMMENT ON COLUMN public.app_settings.enable_email_notifications IS 'Enable/disable automatic email notifications via SES';
COMMENT ON COLUMN public.app_settings.enable_default_template_button IS 'Show secondary button to generate invoice with default template';
COMMENT ON COLUMN public.app_settings.theme IS 'UI theme preference: light or dark';
COMMENT ON COLUMN public.app_settings.default_template_id IS 'Default template ID for quick generation';
COMMENT ON COLUMN public.company_profile.tags IS 'Tags to identify and differentiate company profiles with similar names';
COMMENT ON COLUMN public.company_profile.comments IS 'Internal comments/notes about the company profile';
