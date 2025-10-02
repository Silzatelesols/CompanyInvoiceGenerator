/**
 * Utility functions for handling image URLs and multipart form data
 */

import { fetchS3ObjectAsBase64, isS3Url } from './s3Upload';

// Check if a string is a valid HTTP/HTTPS URL
const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Check if the content appears to be multipart form data
const isMultipartData = (data: string): boolean => {
  // Check for common multipart indicators
  const multipartIndicators = [
    'boundary=',             // Multipart boundary
    'Content-Type: image/',  // Multipart content type
    'Content-Disposition:', // Multipart disposition
    '\r\n\r\n',            // Multipart separator
  ];
  
  return multipartIndicators.some(indicator => 
    data.includes(indicator)
  );
};

// Check if it's a base64 data URL
const isBase64DataUrl = (data: string): boolean => {
  return data.startsWith('data:image/') && data.includes('base64,');
};

// Convert base64 data URL to blob URL for better PDF handling
const convertBase64ToBlob = (base64Data: string): string => {
  try {
    // Extract the base64 part and mime type
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return base64Data;
    
    const mimeType = matches[1];
    const base64String = matches[2];
    
    // For PDF generation, we'll keep the data URL but ensure it's properly formatted
    // Some PDF generators have issues with very long data URLs, so we validate the format
    if (base64String.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(base64String)) {
      return `data:${mimeType};base64,${base64String}`;
    }
    
    return 'https://placehold.co/120x60?text=Invalid+Image';
  } catch (error) {
    console.error('Error processing base64 data:', error);
    return 'https://placehold.co/120x60?text=Error+Loading';
  }
};

// Extract base64 image from multipart data
const extractBase64FromMultipart = (multipartData: string): string | null => {
  try {
    // Look for base64 encoded image data in multipart content
    const base64Match = multipartData.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (base64Match) {
      return convertBase64ToBlob(base64Match[0]);
    }
    
    // Look for raw base64 data after Content-Type header
    const contentTypeMatch = multipartData.match(/Content-Type:\s*image\/([^\r\n;]+)[\r\n]+([A-Za-z0-9+/=\r\n]+)/i);
    if (contentTypeMatch) {
      const imageType = contentTypeMatch[1];
      const base64Data = contentTypeMatch[2].replace(/[\r\n\s]/g, '');
      
      // Validate base64 format
      if (/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
        return convertBase64ToBlob(`data:image/${imageType};base64,${base64Data}`);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting base64 from multipart data:', error);
    return null;
  }
};

// Convert external image URL to base64 data URL
const convertUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = blob.type || 'image/png';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting URL to base64:', error);
    return 'https://placehold.co/120x60?text=Load+Error';
  }
};

// Main function to process logo URL/data
export const processLogoUrl = async (logoData: string | null): Promise<string> => {
  // Default placeholder if no logo data
  if (!logoData) {
    return 'https://placehold.co/120x60?text=Your+Logo';
  }
  
  // If it's an S3 URL, use authenticated retrieval to convert to base64
  if (isS3Url(logoData)) {
    try {
      return await fetchS3ObjectAsBase64(logoData);
    } catch (error) {
      console.error('Failed to retrieve S3 image:', error);
      return 'https://placehold.co/120x60?text=S3+Load+Error';
    }
  }
  
  // If it's already a valid URL, convert to base64 for PDF compatibility
  if (isValidImageUrl(logoData)) {
    return await convertUrlToBase64(logoData);
  }
  
  // If it's a base64 data URL, process it for PDF compatibility
  if (isBase64DataUrl(logoData)) {
    return convertBase64ToBlob(logoData);
  }
  
  // If it appears to be multipart data, try to extract base64
  if (isMultipartData(logoData)) {
    const extractedBase64 = extractBase64FromMultipart(logoData);
    if (extractedBase64) {
      return extractedBase64;
    }
    
    // If extraction failed, return placeholder
    console.warn('Failed to extract image from multipart data, using placeholder');
    return 'https://placehold.co/120x60?text=Multipart+Error';
  }
  
  // If we can't determine the format, assume it might be a relative path or return placeholder
  if (logoData.startsWith('/') || logoData.startsWith('./')) {
    return logoData; // Return relative paths as-is
  }
  
  // Default to placeholder for unrecognized formats
  console.warn('Unrecognized logo format, using placeholder');
  return 'https://placehold.co/120x60?text=Unknown+Format';
};

// Helper function for debugging - returns info about the logo data type
export const getLogoDataInfo = (logoData: string | null): {
  type: 'url' | 'base64' | 'multipart' | 'relative' | 's3' | 'unknown' | 'null';
  isValid: boolean;
  processedUrl: string;
  originalLength?: number;
} => {
  if (!logoData) {
    return {
      type: 'null',
      isValid: false,
      processedUrl: 'https://placehold.co/120x60?text=Your+Logo'
    };
  }
  
  const originalLength = logoData.length;
  
  if (isS3Url(logoData)) {
    return {
      type: 's3',
      isValid: true,
      processedUrl: logoData, // Will be converted to base64 by processLogoUrl
      originalLength
    };
  }
  
  if (isValidImageUrl(logoData)) {
    return {
      type: 'url',
      isValid: true,
      processedUrl: logoData,
      originalLength
    };
  }
  
  if (isBase64DataUrl(logoData)) {
    return {
      type: 'base64',
      isValid: true,
      processedUrl: convertBase64ToBlob(logoData),
      originalLength
    };
  }
  
  if (isMultipartData(logoData)) {
    const extracted = extractBase64FromMultipart(logoData);
    return {
      type: 'multipart',
      isValid: !!extracted,
      processedUrl: extracted || 'https://placehold.co/120x60?text=Multipart+Error',
      originalLength
    };
  }
  
  if (logoData.startsWith('/') || logoData.startsWith('./')) {
    return {
      type: 'relative',
      isValid: true,
      processedUrl: logoData,
      originalLength
    };
  }
  
  return {
    type: 'unknown',
    isValid: false,
    processedUrl: 'https://placehold.co/120x60?text=Unknown+Format',
    originalLength
  };
};
