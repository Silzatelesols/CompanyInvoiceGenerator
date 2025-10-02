/**
 * Calculates the GST breakdown (IGST, CGST, SGST) for a given amount.
 *
 * @param line_total - The total amount before tax for the line item.
 * @param gst_rate - The total GST percentage rate (e.g., 18 for 18%).
 * @param company_state - The state of the company/supplier.
 * @param client_state - The state of the client/recipient.
 * @returns An object containing the calculated igst_amount, cgst_amount, and sgst_amount.
 */
export const calculateGst = (
  line_total: number,
  gst_rate: number,
  company_state: string,
  client_state: string
): { igst_amount: number; cgst_amount: number; sgst_amount: number } => {
  
  const total_gst_amount = line_total * (gst_rate / 100);

  // Normalize states to handle case-insensitivity and extra spaces
  const normalizedCompanyState = company_state.trim().toLowerCase();
  const normalizedClientState = client_state.trim().toLowerCase();

  if (normalizedCompanyState === normalizedClientState) {
    // Intra-state transaction: Apply CGST and SGST
    const cgst_amount = total_gst_amount / 2;
    const sgst_amount = total_gst_amount / 2;
    return {
      igst_amount: 0,
      cgst_amount: parseFloat(cgst_amount.toFixed(2)),
      sgst_amount: parseFloat(sgst_amount.toFixed(2)),
    };
  } else {
    // Inter-state transaction: Apply IGST
    return {
      igst_amount: parseFloat(total_gst_amount.toFixed(2)),
      cgst_amount: 0,
      sgst_amount: 0,
    };
  }
};
