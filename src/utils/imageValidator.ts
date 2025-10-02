/**
 * Image validation utilities to check for corruption and compatibility
 */

export interface ImageValidationResult {
  isValid: boolean;
  format: string | null;
  size: number;
  issues: string[];
  recommendations: string[];
}

// Validate base64 image data
export const validateBase64Image = (base64Data: string): ImageValidationResult => {
  const result: ImageValidationResult = {
    isValid: false,
    format: null,
    size: base64Data.length,
    issues: [],
    recommendations: []
  };

  // Check if it's a proper data URL
  if (!base64Data.startsWith('data:image/')) {
    result.issues.push('Not a valid data URL - missing data:image/ prefix');
    result.recommendations.push('Ensure the image starts with data:image/[format];base64,');
    return result;
  }

  // Extract format and base64 part
  const matches = base64Data.match(/^data:image\/([^;]+);base64,(.+)$/);
  if (!matches) {
    result.issues.push('Invalid data URL format');
    result.recommendations.push('Expected format: data:image/[format];base64,[data]');
    return result;
  }

  const [, format, base64String] = matches;
  result.format = format;

  // Check supported formats
  const supportedFormats = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg+xml'];
  if (!supportedFormats.includes(format.toLowerCase())) {
    result.issues.push(`Unsupported format: ${format}`);
    result.recommendations.push(`Use one of: ${supportedFormats.join(', ')}`);
  }

  // Validate base64 string
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64String)) {
    result.issues.push('Invalid base64 characters detected');
    result.recommendations.push('Base64 string contains invalid characters');
    return result;
  }

  // Check base64 padding
  const paddingCount = (base64String.match(/=/g) || []).length;
  if (paddingCount > 2) {
    result.issues.push('Too many padding characters in base64');
    result.recommendations.push('Base64 should have at most 2 padding characters (=)');
  }

  // Check length (base64 should be divisible by 4 after padding)
  if (base64String.length % 4 !== 0) {
    result.issues.push('Base64 length is not divisible by 4');
    result.recommendations.push('Base64 string length should be divisible by 4');
  }

  // Size warnings
  if (base64Data.length > 100000) {
    result.issues.push('Image data is very large (>100KB)');
    result.recommendations.push('Consider using external URL or compressing image');
  }

  if (base64Data.length > 1000000) {
    result.issues.push('Image data is extremely large (>1MB) - likely to cause PDF issues');
    result.recommendations.push('Strongly recommend using external URL instead');
  }

  // If no critical issues found, mark as valid
  result.isValid = result.issues.filter(issue => 
    !issue.includes('very large') && !issue.includes('Unsupported format')
  ).length === 0;

  if (result.isValid) {
    result.recommendations.push('Image data appears valid for PDF generation');
  }

  return result;
};

// Test if image can be loaded in browser
export const testImageLoad = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

// Convert Google Drive share link to direct link
export const convertGoogleDriveLink = (shareUrl: string): string | null => {
  // Extract file ID from various Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,  // /file/d/FILE_ID
    /id=([a-zA-Z0-9-_]+)/,          // ?id=FILE_ID
    /\/d\/([a-zA-Z0-9-_]+)/         // /d/FILE_ID
  ];

  for (const pattern of patterns) {
    const match = shareUrl.match(pattern);
    if (match) {
      const fileId = match[1];
      // Use thumbnail endpoint which has better CORS support
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
    }
  }

  return null;
};

// Alternative Google Drive link formats that work better for embedding
export const getAlternativeGoogleDriveFormats = (fileId: string): string[] => {
  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w400-h300`,
    `https://docs.google.com/uc?export=view&id=${fileId}`
  ];
};

// Comprehensive image diagnostics
export const diagnoseImageIssue = async (logoData: string | null): Promise<{
  diagnosis: string;
  canProceed: boolean;
  alternativeSolutions: string[];
}> => {
  if (!logoData) {
    return {
      diagnosis: 'No logo data provided',
      canProceed: false,
      alternativeSolutions: [
        'Upload image to Google Drive and use public link',
        'Use a placeholder image URL',
        'Store image as file in public folder'
      ]
    };
  }

  // Check if it's a URL
  if (logoData.startsWith('http')) {
    const canLoad = await testImageLoad(logoData);
    return {
      diagnosis: canLoad ? 'External URL is accessible' : 'External URL cannot be loaded',
      canProceed: canLoad,
      alternativeSolutions: canLoad ? [] : [
        'Check if URL is publicly accessible',
        'Try a different image hosting service',
        'Convert to base64 if image is small'
      ]
    };
  }

  // Check if it's base64
  if (logoData.startsWith('data:image/')) {
    const validation = validateBase64Image(logoData);
    return {
      diagnosis: validation.isValid ? 
        'Base64 image is valid but may be too large for PDF' : 
        `Base64 image has issues: ${validation.issues.join(', ')}`,
      canProceed: validation.isValid && logoData.length < 500000,
      alternativeSolutions: [
        'Upload to Google Drive and use public link',
        'Compress the image to reduce size',
        'Use external image hosting service',
        ...validation.recommendations
      ]
    };
  }

  return {
    diagnosis: 'Unknown image format',
    canProceed: false,
    alternativeSolutions: [
      'Ensure image is either a valid URL or base64 data URL',
      'Upload to Google Drive and use public link',
      'Use a standard image hosting service'
    ]
  };
};
