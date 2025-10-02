# Migration Guide: Base64/Multipart to S3 Storage

This guide helps migrate existing image data from base64/multipart format to S3 storage.

## Overview

The application now uses AWS S3 for image storage instead of storing images as base64 data in the database. This provides:

- Better performance
- Reduced database size
- More reliable PDF generation
- Scalable image storage

## Migration Steps

### 1. Backup Your Database

Before migration, create a backup of your Supabase database:

```sql
-- Export company profiles with logos
SELECT id, company_name, logo_url 
FROM company_profile 
WHERE logo_url IS NOT NULL;
```

### 2. Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 3. Configure AWS S3

1. Set up your `.env` file with AWS credentials (see `.env.example`)
2. Create S3 bucket with public read access
3. Configure CORS policy (see README-S3-SETUP.md)

### 4. Migration Script

Create a migration script to move existing base64 images to S3:

```typescript
import { uploadToS3 } from '@/utils/s3Upload';
import { supabase } from '@/integrations/supabase/client';

async function migrateImagesToS3() {
  // Get all company profiles with base64 logos
  const { data: companies } = await supabase
    .from('company_profile')
    .select('id, logo_url')
    .not('logo_url', 'is', null);

  for (const company of companies || []) {
    if (company.logo_url?.startsWith('data:')) {
      try {
        // Convert base64 to blob
        const response = await fetch(company.logo_url);
        const blob = await response.blob();
        const file = new File([blob], 'logo.png', { type: blob.type });
        
        // Upload to S3
        const s3Url = await uploadToS3(file);
        
        // Update database with S3 URL
        await supabase
          .from('company_profile')
          .update({ logo_url: s3Url })
          .eq('id', company.id);
          
        console.log(`Migrated logo for company ${company.id}`);
      } catch (error) {
        console.error(`Failed to migrate logo for company ${company.id}:`, error);
      }
    }
  }
}
```

### 5. Gradual Migration

The system supports gradual migration:

- **New uploads**: Automatically go to S3
- **Existing base64**: Still works but converts to base64 for PDF
- **Existing URLs**: Still work but convert to base64 for PDF
- **S3 URLs**: Work directly without conversion

### 6. Verification

After migration, verify:

1. Images display correctly in the UI
2. PDF generation works with S3 URLs
3. Upload functionality works
4. Database size has decreased

## Rollback Plan

If issues occur, you can rollback by:

1. Restoring the database backup
2. Removing S3 configuration from `.env`
3. The app will fallback to base64 storage

## Benefits After Migration

- **Faster PDF Generation**: S3 URLs work directly without base64 conversion
- **Reduced Database Size**: No more large base64 strings in database
- **Better Performance**: Images load from CDN
- **Scalability**: Handle unlimited image uploads
- **Cost Efficiency**: Pay only for storage used

## Monitoring

Monitor the migration:

- Check S3 bucket for uploaded images
- Monitor database size reduction
- Test PDF generation with various image types
- Verify upload functionality works correctly
