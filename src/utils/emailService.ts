/**
 * Email service for sending invoice notifications via API Gateway
 */

// Email API Configuration
const EMAIL_API_ENDPOINT = import.meta.env.VITE_EMAIL_API_ENDPOINT || 'https://hv947nzv0k.execute-api.ap-south-1.amazonaws.com/prod';

export interface EmailInvoiceData {
  client_email: string;
  invoice_link: string;
  due_date: string;
  client_name: string;
  company_name: string;
  invoice_number: string;
}

/**
 * Send invoice email via API Gateway
 */
export const sendInvoiceEmail = async (emailData: EmailInvoiceData): Promise<boolean> => {
  try {
    console.log('Sending invoice email:', emailData);

    const response = await fetch(EMAIL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`Email API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    
    // Check if it's a CORS error specifically
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      console.error('This appears to be a CORS error. Check API Gateway CORS configuration.');
    }
    
    throw error;
  }
};

/**
 * Validate email configuration
 */
export const validateEmailConfig = (): boolean => {
  return !!EMAIL_API_ENDPOINT;
};

/**
 * Format date for email (YYYY-MM-DD format)
 */
export const formatDateForEmail = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

/**
 * Generate due date (30 days from invoice date by default)
 */
export const generateDueDate = (invoiceDate: string | Date, daysToAdd: number = 30): string => {
  const dateObj = typeof invoiceDate === 'string' ? new Date(invoiceDate) : invoiceDate;
  const dueDate = new Date(dateObj);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  return formatDateForEmail(dueDate);
};
