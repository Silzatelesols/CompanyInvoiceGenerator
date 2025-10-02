import { Database } from "@/integrations/supabase/types";
import { calculateGst } from "@/lib/gstUtils" // Assuming gstUtils.ts is in the same lib folder
import { processLogoUrl } from "@/utils/imageUtils";

// Define a comprehensive type for all data needed by the template
interface InvoiceData {
  invoice: Database["public"]["Tables"]["invoices"]["Row"];
  items: Database["public"]["Tables"]["invoice_items"]["Row"][];
  client: Database["public"]["Tables"]["clients"]["Row"];
  company: Database["public"]["Tables"]["company_profile"]["Row"];
}

// --- Helper Functions ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number | null) => {
    if (amount === null) return '0.00';
    return amount.toFixed(2);
}

const numberToWords = (num: number): string => {
    const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const toWords = (n: number): string => {
        if (n < 20) return a[n];
        let digit = n % 10;
        return `${b[Math.floor(n / 10)]}${digit ? "-" + a[digit] : ""}`;
    };
    const inWords = (n: number): string => {
        if (n < 100) return toWords(n);
        if (n < 1000) return `${a[Math.floor(n / 100)]} hundred${n % 100 ? " " + toWords(n % 100) : ""}`;
        const thousands = Math.floor(n / 1000);
        const remainder = n % 1000;
        let words = "";
        if (thousands > 0) words += `${inWords(thousands)} thousand`;
        if (remainder > 0) words += ` ${inWords(remainder)}`;
        return words.trim();
    };
    const rupees = inWords(Math.floor(num)).charAt(0).toUpperCase() + inWords(Math.floor(num)).slice(1);
    const paise = Math.round((num % 1) * 100);
    if (paise > 0) return `Rupees ${rupees} and ${toWords(paise)} Paise Only`;
    return `Rupees ${rupees} Only`;
};


// --- Main Template Generation Function ---
export const generateExtrapeTemplate = async (data: InvoiceData): Promise<string> => {
  const { invoice, items, client, company } = data;
  
  // Process logo URL before template generation
  const logoUrl = await processLogoUrl(company.logo_url);
  console.log('Logo processing:', {
    original: company.logo_url,
    processed: logoUrl,
    type: company.logo_url ? (company.logo_url.startsWith('data:') ? 'base64' : 
           company.logo_url.startsWith('http') ? 'url' : 'other') : 'null'
  });
  
  // Calculate total taxable value for the summary
  const totalTaxableValue = items.reduce((sum, item) => sum + (item.line_total || 0), 0);

  // Use the utility to determine GST breakdown
  const { igst_amount, cgst_amount, sgst_amount } = calculateGst(
      totalTaxableValue,
      18, // Assuming a standard rate for the total, individual items can vary
      company.state || "",
      client.state || ""
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GST Invoice Template</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href='https://fonts.googleapis.com/css?family=Alex Brush' rel='stylesheet'>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body { font-family: 'Roboto', sans-serif; color: #000000 !important; }
            * { color: #000000 !important; }
            p, td, th, h1, h2, h3, div, span { color: #000000 !important; }
            .page {
                background: white;
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                overflow: visible;
            }
            .content-body { padding: 12mm; flex: 1; overflow: visible; }
            .footer-content { padding: 12mm; padding-top: 8mm; flex-shrink: 0; }
            .header-section { margin-bottom: 8px; }
            .company-info { line-height: 1.2; }
            .pricing-table td { padding: 5px 8px 5px 8px !important; }
            .compact-spacing { margin: 4px 0 4px 0; }
            .logo-img { 
                max-width: 108px; 
                max-height: 108px; 
                object-fit: contain;
                display: block;
                bottom: 0;
            }
        </style>
    </head>
    <body>
        <div class="page">
            <div class="content-body">
                <header class="header-section flex items-start justify-between pb-3 border-b-2 border-black">
                    ${logoUrl && !logoUrl.includes('placehold.co') ? `
                    <div class="flex-shrink-0" style="margin-right: 3mm;">
                         <img src="${logoUrl}" alt="Company Logo" class="logo-img" onerror="this.style.display='none'">
                    </div>
                    ` : ''}
                    <div class="text-center flex-grow company-info">
                        <h1 class="text-5xl font-bold text-black mb-1" style="font-family: 'Alex Brush';">${company.company_name}</h1>
                        <br>
                        <p class="text-sm text-black mb-1">${company.address}, ${company.city}, ${company.state} - ${company.pin_code}</p>
                        <!-- <p class="text-sm text-black">email: ${company.email}</p> -->
                        
                        ${company.cin || company.gstin ? `
                <div class="flex justify-between items-center mt-2">
                    <div class="text-left">
                        ${company.cin ? `<p class="text-sm text-black"><strong>CIN:</strong> ${company.cin}</p>` : ''}
                    </div>
                    <div class="text-right">
                        ${company.gstin ? `<p class="text-sm text-black"><strong>GSTIN:</strong> ${company.gstin}</p>` : ''}
                    </div>
                </div>
                ` : ''}
                    </div>
                </header>

                <div class="text-center compact-spacing">
                    <h2 class="text-lg font-bold tracking-wider">GST INVOICE</h2>
                </div>

                <div class="flex justify-between text-xs compact-spacing">
                    <div class="w-1/2 pr-4">
                        <div class="grid grid-cols-3 gap-x-2 gap-y-1">
                            <p class="font-bold col-span-1">Invoice From</p><p class="col-span-2">: ${company.company_name}</p>
                            <p class="font-bold col-span-1">Address</p><p class="col-span-2">: ${company.address}, ${company.city}, ${company.state} - ${company.pin_code}</p>
                            <p class="font-bold col-span-1">GSTIN</p><p class="col-span-2">: ${company.gstin}</p>
                            <p class="font-bold col-span-1">PAN</p><p class="col-span-2">: ${company.pan}</p>
                            <p class="font-bold col-span-1">CIN</p><p class="col-span-2">: ${company.cin || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="w-1/2 pl-4">
                         <div class="grid grid-cols-3 gap-x-2 gap-y-1">
                            <p class="font-bold col-span-1">Invoice To</p><p class="col-span-2">: ${client.name}</p>
                            <p class="font-bold col-span-1">Address</p><p class="col-span-2">: ${client.address}, ${client.city}, ${client.state} - ${client.pin_code}</p>
                            <p class="font-bold col-span-1">Place of Supply</p><p class="col-span-2">: ${client.state}</p>
                            <p class="font-bold col-span-1">GSTIN</p><p class="col-span-2">: ${client.gstin}</p>
                            <p class="font-bold col-span-1">Invoice No.</p><p class="col-span-2">: ${invoice.invoice_number}</p>
                            <p class="font-bold col-span-1">Date</p><p class="col-span-2">: ${formatDate(invoice.invoice_date)}</p>
                        </div>
                    </div>
                </div>

                <table class="w-full text-xs border-black border">
                    <thead class="bg-white border-black">
                        <tr>
                            <th class="p-2 border-black border font-bold text-center">S. NO</th>
                            <th class="p-2 border-black border font-bold text-left">Description of Services</th>
                            <th class="p-2 border-black border font-bold text-center">SAC/HSN</th>
                            <th class="p-2 border-black border font-bold text-center">Quantity</th>
                            <th class="p-2 border-black border font-bold text-right">Rate</th>
                            <th class="p-2 border-black border font-bold text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => `
                        <tr>
                            <td class="p-2 border-black border text-center">${index + 1}</td>
                            <td class="p-2 border-black border">${item.item_name}</td>
                            <td class="p-2 border-black border text-center">${item.hsn_sac}</td>
                            <td class="p-2 border-black border text-center">${item.quantity}</td>
                            <td class="p-2 border-black border text-right">${formatCurrency(item.unit_price)}</td>
                            <td class="p-2 border-black border text-right">${formatCurrency(item.line_total)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="flex justify-end mt-1">
                    <div class="w-2/5">
                        <table class="w-full text-xs pricing-table">
                            <tbody>
                                <tr>
                                    <td class="font-bold">Sub Total:</td>
                                    <td class="text-right">₹ ${formatCurrency(invoice.subtotal)}</td>
                                </tr>
                                <tr>
                                    <td class="font-bold">IGST @ 18%:</td>
                                    <td class="text-right">₹ ${formatCurrency(igst_amount)}</td>
                                </tr>
                                <tr>
                                    <td class="font-bold">SGST @ 9%:</td>
                                    <td class="text-right">₹ ${formatCurrency(sgst_amount)}</td>
                                </tr>
                                <tr>
                                    <td class="font-bold">CGST @ 9%:</td>
                                    <td class="text-right">₹ ${formatCurrency(cgst_amount)}</td>
                                </tr>
                                <tr class="font-bold bg-white border-black">
                                    <td class="border-y-black border-y">TOTAL AMOUNT PAYABLE:</td>
                                    <td class="border-y-black border-y text-right">₹ ${formatCurrency(invoice.total_amount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="text-xs compact-spacing">
                    <p><strong>Amount Chargeable (in words):</strong> ${numberToWords(invoice.total_amount || 0)}</p>
                    <p><strong>GST Payable under reverse charge:</strong> ${invoice.gst_payable_reverse_charge ? 'YES' : 'NO'}</p>
                </div>

                 <div class="text-xs compact-spacing">
                    <table class="w-full text-xs border-black border">
                        <thead class="bg-white border-black">
                            <tr>
                                <th class="p-1 border-black border font-bold text-center text-xs">SAC</th>
                                <th class="p-1 border-black border font-bold text-right text-xs">Taxable Value</th>
                                <th class="p-1 border-black border font-bold text-right text-xs">CGST (9%)</th>
                                <th class="p-1 border-black border font-bold text-right text-xs">SGST (9%)</th>
                                <th class="p-1 border-black border font-bold text-right text-xs">IGST (18%)</th>
                                <th class="p-1 border-black border font-bold text-right text-xs">Total Tax Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="p-1 border-black border text-center text-xs">${items[0]?.hsn_sac || ''}</td>
                                <td class="p-1 border-black border text-right text-xs">₹ ${formatCurrency(totalTaxableValue)}</td>
                                <td class="p-1 border-black border text-right text-xs">₹ ${formatCurrency(cgst_amount)}</td>
                                <td class="p-1 border-black border text-right text-xs">₹ ${formatCurrency(sgst_amount)}</td>
                                <td class="p-1 border-black border text-right text-xs">₹ ${formatCurrency(igst_amount)}</td>
                                <td class="p-1 border-black border text-right text-xs">₹ ${formatCurrency(invoice.total_gst)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="footer-content">
                <div class="text-xs compact-spacing pt-2 border-t-black border-t">
                    <p><strong>Bank Account Details:</strong></p>
                    <div class="grid grid-cols-2 gap-x-4 mt-2">
                        <p><strong>Account No:</strong> ${company.bank_account_number}</p>
                        <p><strong>Account Name:</strong> ${company.company_name}</p>
                        <p><strong>Bank & Branch Name:</strong> ${company.bank_name}</p>
                        <p><strong>IFSC Code:</strong> ${company.bank_ifsc}</p>
                        <p><strong>Account Type:</strong> Current Account</p>
                    </div>
                </div>

                <div class="flex justify-end mt-8">
                    <div class="text-center text-xs">
                        <p class="font-bold">For ${company.company_name}</p>
                        <br><br><br>
                        <div class="h-8"></div>
                        <p class="border-t-black border-t pt-1">Director / Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
