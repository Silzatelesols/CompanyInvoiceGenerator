import { generateInvoicePDF } from './pdfGenerator';
import { InvoiceData } from './pdfTemplates';
import { settingsService } from '@/lib/settingsService';
import { authLib } from '@/lib/auth';

/**
 * Generate invoice PDF with user settings applied
 * This wrapper checks user settings and applies them to PDF generation
 */
export const generateInvoicePDFWithSettings = async (
  data: InvoiceData,
  templateId?: string,
  overrideOptions?: { uploadToS3?: boolean; downloadLocal?: boolean; sendEmail?: boolean }
): Promise<{ success: boolean; s3Url?: string; localDownload?: boolean; emailSent?: boolean }> => {
  try {
    // Get current user from custom auth system
    const session = authLib.getSession();
    
    if (!session || !session.user) {
      console.warn('No authenticated user found. Using default settings.');
      // Use default options if no user is authenticated
      return await generateInvoicePDF(
        data,
        templateId || 'modern',
        overrideOptions || { uploadToS3: true, downloadLocal: true, sendEmail: true }
      );
    }

    // Get user settings
    const settings = await settingsService.getOrCreateSettings(session.user.id);

    // Determine template to use
    const finalTemplateId = templateId || settings.default_template_id;

    // Build options based on settings (override options take precedence)
    const options = {
      uploadToS3: overrideOptions?.uploadToS3 !== undefined 
        ? overrideOptions.uploadToS3 
        : settings.enable_s3_upload,
      downloadLocal: overrideOptions?.downloadLocal !== undefined 
        ? overrideOptions.downloadLocal 
        : true, // Always allow local download by default
      sendEmail: overrideOptions?.sendEmail !== undefined 
        ? overrideOptions.sendEmail 
        : settings.enable_email_notifications && settings.enable_s3_upload, // Email requires S3
    };

    console.log('Generating PDF with settings:', {
      templateId: finalTemplateId,
      options,
      userSettings: {
        enable_s3_upload: settings.enable_s3_upload,
        enable_email_notifications: settings.enable_email_notifications,
      }
    });

    // Generate PDF with applied settings
    return await generateInvoicePDF(data, finalTemplateId, options);
  } catch (error) {
    console.error('Error generating PDF with settings:', error);
    // Fallback to default behavior on error
    return await generateInvoicePDF(
      data,
      templateId || 'modern',
      overrideOptions || { uploadToS3: true, downloadLocal: true, sendEmail: true }
    );
  }
};

/**
 * Quick generate with default template (for the secondary button feature)
 */
export const generateInvoiceWithDefaultTemplate = async (
  data: InvoiceData
): Promise<{ success: boolean; s3Url?: string; localDownload?: boolean; emailSent?: boolean }> => {
  try {
    const session = authLib.getSession();
    
    if (!session || !session.user) {
      return await generateInvoicePDF(data, 'modern');
    }

    const settings = await settingsService.getOrCreateSettings(session.user.id);
    
    // Use default template from settings
    return await generateInvoicePDFWithSettings(data, settings.default_template_id);
  } catch (error) {
    console.error('Error generating with default template:', error);
    return await generateInvoicePDF(data, 'modern');
  }
};
