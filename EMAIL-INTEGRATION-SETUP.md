# Email Integration Setup

This document explains how to configure automatic email sending for generated invoices.

## Environment Variables

Add the following environment variable to your `.env` file:

```env
# Email API Configuration
VITE_EMAIL_API_ENDPOINT=https://hv947nzv0k.execute-api.ap-south-1.amazonaws.com/prod
```

## How It Works

When a PDF is generated and uploaded to S3, the system automatically:

1. **Generates PDF** → Converts invoice to PDF format
2. **Uploads to S3** → Stores PDF in public S3 bucket
3. **Sends Email** → Calls API Gateway to send email notification to client

## Email API Payload

The system sends the following data to your API Gateway:

```json
{
  "client_email": "client@example.com",
  "invoice_link": "https://your-company-invoices.s3.ap-south-1.amazonaws.com/pdfs/...",
  "due_date": "2025-10-15",
  "client_name": "John Doe",
  "company_name": "Your Company Name",
  "invoice_number": "INV-202509-450"
}
```

## Field Mapping

| Field | Source | Description |
|-------|--------|-------------|
| `client_email` | `data.client.email` | Client's email address |
| `invoice_link` | S3 URL | Public URL of generated PDF |
| `due_date` | `data.invoice.due_date` or calculated | Invoice due date (YYYY-MM-DD) |
| `client_name` | `data.client.name` or `data.client.company_name` | Client name/company |
| `company_name` | `data.company.company_name` | Your company name |
| `invoice_number` | `data.invoice.invoice_number` | Invoice number |

## Configuration Options

You can control email sending behavior:

```typescript
const result = await generateInvoicePDF(data, templateId, {
  uploadToS3: true,     // Upload PDF to S3
  downloadLocal: true,  // Download PDF locally
  sendEmail: true       // Send email notification
});
```

## Email Sending Conditions

Email is sent only when **ALL** conditions are met:

1. ✅ **S3 upload successful** - PDF must be uploaded to S3 first
2. ✅ **Client email exists** - `data.client.email` must be provided
3. ✅ **Email API configured** - `VITE_EMAIL_API_ENDPOINT` must be set
4. ✅ **Email option enabled** - `sendEmail: true` in options

## Due Date Logic

- **If invoice has due_date**: Uses the existing due date
- **If no due_date**: Automatically calculates 30 days from invoice date
- **Format**: Always sends in YYYY-MM-DD format

## Error Handling

- **Email failure doesn't break PDF generation** - PDF will still be created and downloaded
- **Errors are logged** but don't throw exceptions
- **User sees status** in success message (e.g., "PDF generated, uploaded, and email sent")

## Success Messages

The user will see different messages based on what succeeded:

- **All successful**: "PDF generated successfully! Downloaded locally, uploaded to cloud storage and email sent to client."
- **No email**: "PDF generated successfully! Downloaded locally and uploaded to cloud storage."
- **Local only**: "PDF generated successfully! Downloaded locally."

## Testing

To test email integration:

1. Ensure client has email address in database
2. Set `VITE_EMAIL_API_ENDPOINT` in `.env`
3. Generate an invoice PDF
4. Check console logs for email sending status
5. Verify email received by client

## Troubleshooting

### Email Not Sending

Check these conditions:
- ✅ Client email address exists
- ✅ S3 upload successful (PDF URL available)
- ✅ `VITE_EMAIL_API_ENDPOINT` configured
- ✅ API Gateway endpoint is accessible
- ✅ No CORS issues with API Gateway

### API Gateway Errors

Common issues:
- **403 Forbidden**: Check API Gateway permissions
- **500 Internal Error**: Check Lambda function logs
- **CORS Error**: Configure CORS on API Gateway
- **Timeout**: Increase Lambda timeout settings

### Console Logs

Monitor these logs:
```
PDF uploaded to S3: https://...
Sending invoice email: {...}
Email sent successfully: {...}
Invoice email sent successfully to: client@example.com
```

## Security Notes

- Email API endpoint should use HTTPS
- Consider adding API key authentication
- Validate email addresses before sending
- Rate limit email sending to prevent abuse
- Log email sending for audit purposes
