import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TEMPLATE_GENERATORS, InvoiceData } from './pdfTemplates';
import { uploadPdfToS3, validatePdfS3Config } from './s3Upload';
import { sendInvoiceEmail, validateEmailConfig, formatDateForEmail, generateDueDate } from './emailService';

export const generateInvoicePDF = async (
  data: InvoiceData, 
  templateId: string = 'modern',
  options: { uploadToS3?: boolean; downloadLocal?: boolean; sendEmail?: boolean } = { uploadToS3: true, downloadLocal: true, sendEmail: true }
): Promise<{ success: boolean; s3Url?: string; localDownload?: boolean; emailSent?: boolean }> => {
  // Get the template generator function
  const templateGenerator = TEMPLATE_GENERATORS[templateId as keyof typeof TEMPLATE_GENERATORS] || TEMPLATE_GENERATORS.modern;

  // Create a temporary div for PDF content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '20px';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.fontSize = '12px';
  tempDiv.style.lineHeight = '1.4';

  // Generate HTML content using the selected template
  const htmlContent = await templateGenerator(data);
  tempDiv.innerHTML = htmlContent;

  document.body.appendChild(tempDiv);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight,
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const fileName = `Invoice-${data.invoice.invoice_number}`;
    let s3Url: string | undefined;
    let localDownload = false;
    let emailSent = false;

    // Upload to S3 if configured and requested
    if (options.uploadToS3 && validatePdfS3Config()) {
      try {
        // Convert PDF to blob
        const pdfBlob = pdf.output('blob');
        s3Url = await uploadPdfToS3(pdfBlob, fileName);
        console.log('PDF uploaded to S3:', s3Url);
      } catch (error) {
        console.error('Failed to upload PDF to S3:', error);
        // Continue with local download as fallback
      }
    }

    // Send email if S3 upload successful and email is requested
    if (options.sendEmail && s3Url && data.client.email && validateEmailConfig()) {
      try {
        const dueDate = data.invoice.due_date 
          ? formatDateForEmail(data.invoice.due_date)
          : generateDueDate(data.invoice.invoice_date);

        await sendInvoiceEmail({
          client_email: data.client.email,
          invoice_link: s3Url,
          due_date: dueDate,
          client_name: data.client.name || data.client.company_name || 'Valued Client',
          company_name: data.company?.company_name || 'Your Company',
          invoice_number: data.invoice.invoice_number,
        });

        emailSent = true;
        console.log('Invoice email sent successfully to:', data.client.email);
      } catch (error) {
        console.error('Failed to send invoice email:', error);
        // Don't throw error - email failure shouldn't break PDF generation
      }
    }

    // Download locally if requested
    if (options.downloadLocal) {
      pdf.save(`${fileName}.pdf`);
      localDownload = true;
    }

    return {
      success: true,
      s3Url,
      localDownload,
      emailSent
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};