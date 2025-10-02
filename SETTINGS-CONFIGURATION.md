# Settings & Configuration System

## Overview

Billify Easy Suite now includes a comprehensive settings system that allows users to customize their experience and control which features are enabled. This document explains the settings system, its features, and how to use it.

## Features

### 1. Feature Toggles

#### AWS S3 Upload
- **Purpose**: Control whether PDFs and images are uploaded to AWS S3
- **Default**: Enabled
- **Behavior**:
  - When **enabled**: Generated PDFs are uploaded to S3 bucket and images are stored in cloud
  - When **disabled**: PDFs are only downloaded locally, no cloud storage
- **Use Case**: Disable if you don't have AWS S3 configured or prefer local-only operation

#### Email Notifications (SES)
- **Purpose**: Automatically send invoice emails to clients via AWS SES
- **Default**: Enabled
- **Dependencies**: Requires S3 upload to be enabled (emails need public PDF URLs)
- **Behavior**:
  - When **enabled**: After PDF generation and S3 upload, an email is automatically sent to the client
  - When **disabled**: No automatic emails are sent
- **Use Case**: Disable if you don't have AWS SES configured or prefer manual email sending

#### Quick Default Template Button
- **Purpose**: Show a secondary "Quick Generate" button for instant PDF generation with default template
- **Default**: Disabled
- **Behavior**:
  - When **enabled**: A "Quick Generate" button appears on invoice detail pages
  - When **disabled**: Only the standard "Download PDF" button is shown
- **Use Case**: Enable if you frequently use the same template and want faster generation

### 2. Appearance Settings

#### Theme
- **Options**: Light, Dark
- **Default**: Light
- **Behavior**: Changes the entire application's color scheme
- **Persistence**: Theme preference is saved per user

### 3. Template Settings

#### Default Template
- **Options**: Modern, Extrape, Default
- **Default**: Modern
- **Purpose**: Set which template is used for quick generation
- **Behavior**: When using the "Quick Generate" button, this template is automatically selected

## Database Schema

### app_settings Table

```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id),
  enable_s3_upload BOOLEAN DEFAULT true,
  enable_email_notifications BOOLEAN DEFAULT true,
  enable_default_template_button BOOLEAN DEFAULT false,
  theme VARCHAR(20) DEFAULT 'light',
  default_template_id VARCHAR(50) DEFAULT 'modern',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### company_profile Updates

Added two new fields to help manage multiple company profiles:

```sql
ALTER TABLE company_profile
ADD COLUMN tags TEXT[],
ADD COLUMN comments TEXT;
```

#### Tags
- **Purpose**: Identify and differentiate company profiles with similar names
- **Type**: Array of strings
- **Examples**: `['main-office', 'branch-mumbai', 'backup-contact']`
- **Use Case**: When you have multiple entries for the same company with minor variations (different emails, phone numbers, etc.)

#### Comments
- **Purpose**: Internal notes about the company profile
- **Type**: Text
- **Examples**: "Preferred contact for urgent matters", "Use this profile for international clients"
- **Use Case**: Add context and notes that help you choose the right company profile

## Usage

### Accessing Settings

1. Navigate to the **Settings** page via the navigation menu
2. The Settings icon appears in the top navigation bar
3. All settings are automatically saved when you click "Save Settings"

### PDF Generation Workflow

The PDF generation now respects user settings:

```typescript
// Automatic settings application
generateInvoicePDFWithSettings(invoiceData, templateId)

// Quick generation with default template
generateInvoiceWithDefaultTemplate(invoiceData)
```

#### Workflow Steps:

1. **User clicks "Download PDF"**:
   - Template selector appears
   - User selects template
   - Settings are checked:
     - S3 upload enabled? → Upload to S3
     - Email notifications enabled? → Send email to client
     - Always download locally

2. **User clicks "Quick Generate"** (if enabled):
   - Uses default template from settings
   - Applies all feature settings
   - No template selection needed

### Settings Priority

Settings are applied in this order:

1. **Override options** (if provided in code)
2. **User settings** (from database)
3. **Default values** (fallback)

## API Reference

### SettingsService

```typescript
import { settingsService } from '@/lib/settingsService';

// Get user settings
const settings = await settingsService.getUserSettings(userId);

// Get or create settings (creates defaults if none exist)
const settings = await settingsService.getOrCreateSettings(userId);

// Update settings
const updated = await settingsService.updateSettings(userId, {
  enable_s3_upload: false,
  theme: 'dark'
});

// Check if feature is enabled
const isEnabled = await settingsService.isFeatureEnabled(
  userId, 
  'enable_s3_upload'
);

// Get theme
const theme = await settingsService.getTheme(userId);

// Get default template
const template = await settingsService.getDefaultTemplate(userId);
```

### PDF Generation with Settings

```typescript
import { 
  generateInvoicePDFWithSettings,
  generateInvoiceWithDefaultTemplate 
} from '@/utils/pdfGeneratorWithSettings';

// Generate with settings applied
const result = await generateInvoicePDFWithSettings(
  invoiceData,
  'modern' // optional template override
);

// Quick generate with default template
const result = await generateInvoiceWithDefaultTemplate(invoiceData);

// Override specific options
const result = await generateInvoicePDFWithSettings(
  invoiceData,
  'modern',
  {
    uploadToS3: false, // Force disable S3 for this generation
    sendEmail: true
  }
);
```

## Migration

### Running the Migration

Apply the migration to add settings support:

```bash
# For Supabase
supabase migration up

# For MySQL (if migrated)
# Run the migration script through your MySQL client
```

### Migration File

Location: `supabase/migrations/20251002000000_add_settings_and_tags.sql`

The migration:
- Creates `app_settings` table
- Adds `tags` and `comments` columns to `company_profile`
- Creates indexes for performance
- Inserts default settings for existing users
- Adds update triggers

## Environment Variables

No new environment variables are required for the settings system itself. However, the features controlled by settings require:

### For S3 Upload:
```env
VITE_AWS_S3_BUCKET=your-bucket-name
VITE_AWS_S3_PDF_BUCKET=your-pdf-bucket-name
VITE_AWS_REGION=ap-south-1
VITE_AWS_ACCESS_KEY_ID=your-access-key
VITE_AWS_SECRET_ACCESS_KEY=your-secret-key
```

### For Email Notifications:
```env
VITE_EMAIL_API_ENDPOINT=https://your-api-gateway-url/prod
```

## Best Practices

### 1. Company Profile Tags

Use consistent tag naming:
- `main-office` - Primary company contact
- `branch-{city}` - Branch offices
- `backup-contact` - Alternative contact information
- `international` - For international clients
- `urgent-only` - For urgent matters only

### 2. Settings Management

- Review settings after initial setup
- Enable "Quick Generate" button only if you use one template consistently
- Disable S3/Email if not configured to avoid errors in logs
- Use dark theme for reduced eye strain during extended use

### 3. Performance

- Settings are cached per session
- Database queries are optimized with indexes
- Theme changes apply immediately without page reload

## Troubleshooting

### Settings Not Saving

1. Check browser console for errors
2. Verify user is authenticated
3. Check database connection
4. Ensure migration was applied successfully

### Quick Generate Button Not Showing

1. Go to Settings page
2. Enable "Quick Default Template Button"
3. Click "Save Settings"
4. Refresh the invoice detail page

### Theme Not Applying

1. Clear browser cache
2. Check if `dark` class is added to `<html>` element
3. Verify settings were saved successfully

### PDF Generation Ignoring Settings

1. Ensure you're using `generateInvoicePDFWithSettings` instead of `generateInvoicePDF`
2. Check that settings exist for the user
3. Verify no override options are forcing different behavior

## Future Enhancements

Potential additions to the settings system:

- **Invoice numbering format** preferences
- **Default currency** and locale settings
- **PDF quality** settings (file size vs quality trade-off)
- **Auto-save** intervals for invoice forms
- **Notification** preferences (browser notifications, sound alerts)
- **Export formats** (PDF, Excel, CSV preferences)
- **Language** preferences for multi-language support

## Support

For issues or questions about the settings system:

1. Check this documentation
2. Review the migration file for database schema
3. Check browser console for errors
4. Verify environment variables are set correctly
5. Ensure all dependencies are installed

## Summary

The settings system provides:
- ✅ Flexible feature control per user
- ✅ Theme customization
- ✅ Template preferences
- ✅ Company profile organization with tags
- ✅ Automatic settings application in PDF generation
- ✅ Backward compatibility with existing code
- ✅ Easy migration path

All settings are user-specific and persist across sessions, providing a personalized experience for each user of the Billify Easy Suite.
