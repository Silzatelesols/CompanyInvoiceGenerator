import { Database } from "@/integrations/supabase/types";

export interface InvoiceData {
  invoice: Database["public"]["Tables"]["invoices"]["Row"];
  items: Database["public"]["Tables"]["invoice_items"]["Row"][];
  client: Database["public"]["Tables"]["clients"]["Row"];
  company: Database["public"]["Tables"]["company_profile"]["Row"];
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}