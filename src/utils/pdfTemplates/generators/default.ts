import { Database } from "@/integrations/supabase/types";
import { calculateGst } from "@/lib/gstUtils";
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
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const g = ["", "Thousand", "Lakh", "Crore"];
    
    const toWords = (n: number): string => {
        if (n < 20) return a[n];
        let digit = n % 10;
        return `${b[Math.floor(n / 10)]}${digit ? " " + a[digit] : ""}`;
    };
    
    const convertToWords = (n: number): string => {
        if (n === 0) return "";
        if (n < 100) return toWords(n);
        if (n < 1000) return `${a[Math.floor(n / 100)]} Hundred${n % 100 ? " " + toWords(n % 100) : ""}`;
        
        // Indian numbering system
        const crore = Math.floor(n / 10000000);
        const lakh = Math.floor((n % 10000000) / 100000);
        const thousand = Math.floor((n % 100000) / 1000);
        const remainder = n % 1000;
        
        let words = "";
        if (crore > 0) words += `${toWords(crore)} Crore `;
        if (lakh > 0) words += `${toWords(lakh)} Lakh `;
        if (thousand > 0) words += `${toWords(thousand)} Thousand `;
        if (remainder > 0) {
            if (remainder < 100) words += toWords(remainder);
            else words += `${a[Math.floor(remainder / 100)]} Hundred${remainder % 100 ? " " + toWords(remainder % 100) : ""}`;
        }
        return words.trim();
    };
    
    const rupees = convertToWords(Math.floor(num));
    const paise = Math.round((num % 1) * 100);
    
    if (paise > 0) return `${rupees} And ${toWords(paise)} Paise`;
    return rupees;
};

// --- Main Template Generation Function ---
export const generateDefaultTemplate = async (data: InvoiceData): Promise<string> => {
  const { invoice, items, client, company } = data;

  // Debug logging to check data
  console.log('Default Template - Company Data:', {
    phone: company.phone,
    email: company.email,
    company_name: company.company_name,
    cin: company.cin,
    gstin: company.gstin
  });
  
  // Process logo URL before template generation
  const logoUrl = await processLogoUrl(company.logo_url);
  console.log('Logo processing:', {
    original: company.logo_url,
    processed: logoUrl,
    type: company.logo_url ? (company.logo_url.startsWith('data:') ? 'base64' : 
           company.logo_url.startsWith('http') ? 'url' : 'other') : 'null'
  });
  
  // Calculate total taxable value
  const totalTaxableValue = items.reduce((sum, item) => sum + (item.line_total || 0), 0);
  
  // Calculate base amount (first item or subtotal)
  const baseAmount = invoice.subtotal || 0;
  
  // Use the utility to determine GST breakdown
  const gstBreakdown = calculateGst(
      totalTaxableValue,
      18, // Assuming a standard rate for the total, individual items can vary
      company.state || "",
      client.state || ""
  );

  const cgstAmount = gstBreakdown.cgst_amount;
  const sgstAmount = gstBreakdown.sgst_amount;
  const igstAmount = gstBreakdown.igst_amount;
  const totalAmount = invoice.total_amount || 0;
  
  // Get service description from first item
  const serviceDescription = items.length > 0 ? items[0].item_name : "Services rendered";
  
  // Calculate payment percentage (default to 100%)
  const paymentPercentage = 100;
  
  // Amount in words
  const amountInWords = numberToWords(totalAmount);

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
                padding: 12mm;
            }
            .header-section { margin-bottom: 8px; }
            .company-info { line-height: 1.2; }
            .info-section { margin: 12px 0; }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
            }
            th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f0f0f0;
                font-weight: bold;
            }
            .total-row {
                font-weight: bold;
                background-color: #f0f0f0;
            }
            .signature-section {
                margin-top: 40px;
                text-align: right;
            }
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
        <!-- Company Letterhead -->
        <header class="header-section flex items-start justify-between pb-3 border-b-2 border-black">
            ${logoUrl && !logoUrl.includes('placehold.co') ? `
            <div class="flex-shrink-0" style="margin-right: 3mm;">
                 <img src="${logoUrl}" alt="Company Logo" class="logo-img" onerror="this.style.display='none'">
            </div>
            ` : ''}
            <div class="text-center flex-grow company-info">
                <h1 class="text-5xl font-bold text-black mb-1" style="font-family: 'Alex Brush';">${company.company_name || ''}</h1>
                <br>
                <p class="text-sm text-black mb-1">${company.address || ''}, ${company.city || ''}, ${company.state || ''} - ${company.pin_code || ''}</p>
                <p class="text-sm text-black mb-2">
                    <strong>Tel:</strong> ${company.phone || ''} |
                    <strong>Email:</strong> ${company.email || ''}
                </p>
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


        <!-- Date and Invoice Number -->
        <div class="info-section">
            <p><strong>Date</strong> – ${formatDate(invoice.invoice_date)}</p>
            <p><strong>Invoice No:</strong> ${invoice.invoice_number || ''}</p>
        </div>
        
        <!-- Customer Details -->
        <div class="info-section">
            <p><strong>${client.name || ''}</strong></p>
            <p>${client.address || ''}</p>
            <p>${client.city || ''}, ${client.state || ''}-${client.pin_code || ''}</p>
        </div>
        
        <div class="info-section">
            <p><strong>Customer's GSTN:</strong> ${client.gstin || ''}</p>
        </div>
        
        <!-- Invoice Items Table -->
        <table>
            <thead>
                <tr>
                    <th style="width: 80px;">Sr. No.</th>
                    <th>Particulars</th>
                    <th style="width: 150px;" class="text-right">Amount (Rs.)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>${serviceDescription}</td>
                    <td class="text-right">${formatCurrency(baseAmount)}</td>
                </tr>
                ${igstAmount > 0 ? `
                <tr>
                    <td>2</td>
                    <td>IGST @18%</td>
                    <td class="text-right">${formatCurrency(igstAmount)}</td>
                </tr>
                ` : `
                <tr>
                    <td>2</td>
                    <td>CGST @9%</td>
                    <td class="text-right">${formatCurrency(cgstAmount)}</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>SGST @9%</td>
                    <td class="text-right">${formatCurrency(sgstAmount)}</td>
                </tr>
                `}
                <tr class="total-row">
                    <td>${igstAmount > 0 ? '3' : '4'}</td>
                    <td>Total</td>
                    <td class="text-right">${formatCurrency(totalAmount)}</td>
                </tr>
            </tbody>
        </table>
        
        <!-- Amount in Words -->
        <div class="info-section">
            <p><strong>Rupees ${amountInWords} Only</strong></p>
        </div>
        
        <!-- Payment Terms -->
        <div class="info-section">
            <p>You are requested to kindly release ${paymentPercentage}% of this amount as per the terms agreed upon, at the earliest.</p>
        </div>
        
        <div class="info-section">
            <p>Thanking you in anticipation.</p>
        </div>
        
        <!-- Signature Section -->
        <div class="signature-section">
            <p><strong>For ${company.company_name || ''}</strong></p>
            <p style="margin-top: 5px;">${company.company_name || ''}</p>
            <p style="font-style: italic; font-size: 12px;">Director</p>
            <br><br><br><br>
            <p style="font-weight: bold;">Authorised Signatory</p>
        </div>
    </div>
</body>
</html>
  `;
};
