-- Create custom_templates table for drag-and-drop template builder
CREATE TABLE IF NOT EXISTS public.custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  
  -- Template metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Template layout (stored as JSONB for flexibility)
  layout JSONB NOT NULL,
  
  -- Template settings
  is_default BOOLEAN DEFAULT false,
  thumbnail TEXT, -- Base64 or S3 URL of template preview
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique template names per user
  UNIQUE(user_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_templates_user_id ON public.custom_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_templates_is_default ON public.custom_templates(user_id, is_default);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_custom_templates_updated_at 
BEFORE UPDATE ON public.custom_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.custom_templates IS 'User-created custom invoice templates from drag-and-drop builder';
COMMENT ON COLUMN public.custom_templates.layout IS 'JSONB containing template layout, components, and styles';
COMMENT ON COLUMN public.custom_templates.is_default IS 'Whether this is the users default template for invoice generation';
COMMENT ON COLUMN public.custom_templates.thumbnail IS 'Preview image of the template (base64 or S3 URL)';
