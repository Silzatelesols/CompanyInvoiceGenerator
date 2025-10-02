import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET;
const S3_REGION = import.meta.env.VITE_AWS_REGION;
const S3_PDF_BUCKET = import.meta.env.VITE_AWS_S3_PDF_BUCKET; // Public bucket for PDFs

// Validate required env vars early
if (!S3_BUCKET || !S3_REGION) {
  // Fail fast with a clear message
  throw new Error('Missing S3 configuration. Ensure VITE_AWS_S3_BUCKET and VITE_AWS_REGION are set in your .env');
}

// Initialize S3 Client with minimal configuration
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false,
  // Disable the default user agent to prevent header issues
  customUserAgent: 'billify-easy-suite/1.0.0',
});

/**
 * Generate a unique filename for S3 storage
 */
const generateFileName = (originalName: string, prefix: string = 'logos'): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'png';
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload a file to S3
 */
export const uploadToS3 = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const fileName = generateFileName(file.name);

    // Create upload command
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileName,
      // Use Uint8Array to avoid ReadableStream code path in SDK
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
    });

    // Upload to S3
    await s3Client.send(command);
    
    // Return the public URL
    const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fileName}`;
    
    if (onProgress) {
      onProgress(100);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Upload file from URL to S3 bucket
 */
export const uploadUrlToS3 = async (
  imageUrl: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Extract filename from URL or generate one
    const urlParts = imageUrl.split('/');
    const originalName = urlParts[urlParts.length - 1] || 'image.png';
    const fileName = generateFileName(originalName);
    
    // Create upload command
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileName,
      // Use Uint8Array to avoid ReadableStream code path in SDK
      Body: new Uint8Array(await blob.arrayBuffer()),
      ContentType: contentType,
    });

    // Upload to S3
    await s3Client.send(command);
    
    // Return the public URL
    const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fileName}`;
    
    if (onProgress) {
      onProgress(100);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading URL to S3:', error);
    throw new Error('Failed to upload image URL to S3');
  }
};

/**
 * Delete file from S3 bucket
 */
export const deleteFromS3 = async (s3Url: string): Promise<void> => {
  try {
    // Extract the key from the S3 URL
    const url = new URL(s3Url);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete image from S3');
  }
};

/**
 * Check if URL is an S3 URL
 */
export const isS3Url = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('s3') || urlObj.hostname.includes('amazonaws.com');
  } catch {
    return false;
  }
};

/**
 * Validate S3 configuration
 */
export const validateS3Config = (): boolean => {
  const requiredEnvVars = [
    'VITE_AWS_S3_BUCKET',
    'VITE_AWS_REGION',
    'VITE_AWS_ACCESS_KEY_ID',
    'VITE_AWS_SECRET_ACCESS_KEY'
  ];
  
  return requiredEnvVars.every(envVar => import.meta.env[envVar]);
};

/**
 * Get a signed URL for reading an S3 object (valid for 1 hour)
 */
export const getS3SignedUrl = async (s3Url: string): Promise<string> => {
  try {
    // Extract the key from the S3 URL
    const url = new URL(s3Url);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    // Generate signed URL valid for 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL for S3 object');
  }
};

/**
 * Retrieve S3 object as base64 data URL using authenticated request
 */
export const getS3ObjectAsBase64 = async (s3Url: string): Promise<string> => {
  try {
    // Extract the key from the S3 URL
    const url = new URL(s3Url);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    // Get the object from S3
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('No data received from S3');
    }

    // Convert the response body to Uint8Array
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Combine all chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...combined));
    const contentType = response.ContentType || 'image/png';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error retrieving S3 object as base64:', error);
    throw new Error('Failed to retrieve S3 object as base64');
  }
};

/**
 * Retrieve S3 object using authenticated fetch with signed URL
 */
export const fetchS3ObjectAsBase64 = async (s3Url: string): Promise<string> => {
  try {
    // Get signed URL first
    const signedUrl = await getS3SignedUrl(s3Url);
    
    // Fetch the image using the signed URL
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch S3 object: ${response.status}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const contentType = blob.type || 'image/png';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching S3 object as base64:', error);
    throw new Error('Failed to fetch S3 object as base64');
  }
};

/**
 * Upload PDF blob to public S3 bucket
 */
export const uploadPdfToS3 = async (
  pdfBlob: Blob,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Check if PDF bucket is configured
    if (!S3_PDF_BUCKET) {
      throw new Error('PDF S3 bucket not configured. Set VITE_AWS_S3_PDF_BUCKET in your .env');
    }

    // Generate unique filename for PDF
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const pdfFileName = `pdfs/${timestamp}-${randomString}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`;

    // Create upload command (removed ACL - use bucket policy instead)
    const command = new PutObjectCommand({
      Bucket: S3_PDF_BUCKET,
      Key: pdfFileName,
      Body: new Uint8Array(await pdfBlob.arrayBuffer()),
      ContentType: 'application/pdf',
      // Public access should be handled by bucket policy, not object ACL
    });

    // Upload to S3
    const response = await s3Client.send(command);
    console.log('PDF upload response:', response);
    
    // Return the public URL
    const publicUrl = `https://${S3_PDF_BUCKET}.s3.${S3_REGION}.amazonaws.com/${pdfFileName}`;
    
    if (onProgress) {
      onProgress(100);
    }
    
    console.log('PDF uploaded successfully to:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading PDF to S3:', error);
    throw error;
  }
};

/**
 * Validate PDF S3 configuration
 */
export const validatePdfS3Config = (): boolean => {
  return !!(S3_PDF_BUCKET && S3_REGION && import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY);
};
