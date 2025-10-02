import { supabase } from "@/integrations/supabase/client";

/**
 * Generates invoice number in format: DDMMYYINV####
 * Where #### is the sequential invoice number for the current month
 * 
 * @returns Promise<string> - Generated invoice number
 */
export const generateInvoiceNumber = async (): Promise<string> => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  
  // Get the start and end of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  
  try {
    // Count invoices created in the current month
    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd);
    
    if (error) {
      console.error('Error counting invoices:', error);
      // Fallback to random number if query fails
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      return `${day}${month}${year}INV${random}`;
    }
    
    // Increment count by 1 for the new invoice
    const invoiceSequence = ((count || 0) + 1).toString().padStart(4, '0');
    
    return `${day}${month}${year}INV${invoiceSequence}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to random number
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${day}${month}${year}INV${random}`;
  }
};
