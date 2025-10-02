# S3 PDF Storage Setup

This document explains how to configure S3 storage for generated PDFs with public access.

## Environment Variables

Add the following environment variable to your `.env` file:

```env
# Existing S3 configuration for images (private bucket)
VITE_AWS_S3_BUCKET=your-private-images-bucket
VITE_AWS_REGION=ap-south-1
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key

# New: Public S3 bucket for PDFs
VITE_AWS_S3_PDF_BUCKET=your-public-pdfs-bucket
```

## S3 Bucket Configuration

### 1. Create a Public PDF Bucket

1. Create a new S3 bucket for PDFs (e.g., `your-company-invoices-public`)
2. **Disable "Block all public access"** in bucket settings
3. Configure the bucket policy for public read access (see below)

### 2. Bucket Policy (Required)

Apply this bucket policy to make PDFs publicly readable:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-public-pdfs-bucket/*"
        }
    ]
}
```

**Important:** Replace `your-public-pdfs-bucket` with your actual bucket name.

### 3. IAM User Permissions

Ensure your IAM user has the following permissions for both buckets:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::your-private-images-bucket/*",
                "arn:aws:s3:::your-public-pdfs-bucket/*"
            ]
        }
    ]
}
```

**Note:** We removed `s3:PutObjectAcl` as we're using bucket policy instead of object ACL.

## Troubleshooting

### CORS Errors
If you see CORS errors, it's likely because:
1. **Bucket policy not applied correctly** - Double-check the bucket policy
2. **Public access still blocked** - Ensure "Block all public access" is disabled
3. **Wrong bucket name** - Verify `VITE_AWS_S3_PDF_BUCKET` matches your actual bucket name

### 403 Forbidden Errors
- Check IAM user permissions
- Verify bucket policy is correctly applied
- Ensure bucket exists and is in the correct region

### Network Errors
- Verify AWS credentials are correct
- Check if bucket name contains invalid characters
- Ensure region matches your bucket's region

## How It Works

1. **Images**: Uploaded to private S3 bucket, accessed via signed URLs
2. **PDFs**: Generated and uploaded to public S3 bucket with bucket policy allowing public read
3. **PDF Access**: Direct public URLs that can be shared or embedded

## Features

- ✅ **Automatic PDF Upload**: Generated PDFs are automatically uploaded to S3
- ✅ **Public Access**: PDFs can be accessed directly via public URLs
- ✅ **Local Fallback**: Still downloads locally if S3 upload fails
- ✅ **Flexible Options**: Can configure upload/download behavior per generation
- ✅ **Secure Images**: Images remain in private bucket with authenticated access

## Usage

The PDF generation now returns both local download and S3 URL:

```typescript
const result = await generateInvoicePDF(data, templateId);

if (result.success) {
  if (result.s3Url) {
    console.log("PDF available at:", result.s3Url);
    // Share this URL or store it in database
  }
  if (result.localDownload) {
    console.log("PDF downloaded locally");
  }
}
```

## Benefits

1. **Shareable Links**: Generate public URLs for invoices
2. **Email Integration**: Include direct PDF links in emails
3. **Client Portal**: Allow clients to access PDFs directly
4. **Backup Storage**: PDFs are stored in cloud for backup
5. **Performance**: No need for authentication when accessing PDFs
