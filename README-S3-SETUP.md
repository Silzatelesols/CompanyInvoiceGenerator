# AWS S3 Integration Setup

This guide will help you set up AWS S3 for image storage in the Billify application.

## Prerequisites

1. AWS Account
2. S3 Bucket created
3. IAM User with appropriate permissions

## Step 1: Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket (e.g., `billify-assets`)
3. Enable public read access for uploaded images
4. Configure CORS policy:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## Step 2: Create IAM User

1. Go to AWS IAM Console
2. Create a new user for programmatic access
3. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## Step 3: Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Step 4: Environment Variables

Copy `.env.example` to `.env` and fill in your AWS credentials:

```env
VITE_AWS_S3_BUCKET=your-s3-bucket-name
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## Step 5: Test the Integration

1. Start the development server: `npm run dev`
2. Go to Company Profile
3. Try uploading an image or adding an image URL
4. Check if the image is uploaded to your S3 bucket

## Features

- **Automatic S3 Upload**: Files dropped in the image dropzone are automatically uploaded to S3
- **URL to S3**: External image URLs are downloaded and re-uploaded to S3 for reliability
- **Fallback Support**: If S3 is not configured, the app falls back to base64 storage
- **Progress Indication**: Upload progress is shown to users
- **PDF Compatibility**: S3 URLs work directly in PDF generation without conversion

## Benefits

- **Reliable Image Loading**: S3 URLs are more reliable than external URLs for PDF generation
- **Better Performance**: Images load faster from S3 CDN
- **Scalability**: No database bloat from large base64 images
- **Cost Effective**: Pay only for storage and bandwidth used
