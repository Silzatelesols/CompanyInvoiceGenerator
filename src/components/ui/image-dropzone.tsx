import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Link, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { convertGoogleDriveLink, testImageLoad, getAlternativeGoogleDriveFormats } from '@/utils/imageValidator';
import { uploadToS3, uploadUrlToS3, validateS3Config, getS3SignedUrl, isS3Url } from '@/utils/s3Upload';

interface ImageDropzoneProps{
  value?: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  label,
  className
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(value || null);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update display URL when preview changes
  useEffect(() => {
    const updateDisplayUrl = async () => {
      if (!preview) {
        setDisplayUrl(null);
        return;
      }

      // If it's an S3 URL, get a signed URL for display
      if (isS3Url(preview)) {
        try {
          const signedUrl = await getS3SignedUrl(preview);
          setDisplayUrl(signedUrl);
        } catch (error) {
          console.error('Failed to get signed URL for preview:', error);
          setDisplayUrl('https://placehold.co/120x60?text=S3+Preview+Error');
        }
      } else {
        // For non-S3 URLs, use directly
        setDisplayUrl(preview);
      }
    };

    updateDisplayUrl();
  }, [preview]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      // Check if S3 is configured
      if (!validateS3Config()) {
        // Fallback to base64 if S3 not configured
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreview(result);
          onChange(result);
        };
        reader.readAsDataURL(file);
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        // Upload to S3
        const s3Url = await uploadToS3(file, (progress) => {
          setUploadProgress(progress);
        });
        
        setPreview(s3Url);
        onChange(s3Url);
      } catch (error) {
        console.error('S3 upload failed:', error);
        // Fallback to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreview(result);
          onChange(result);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    let processedUrl = urlInput.trim();
    
    // Convert Google Drive share link to direct link
    if (urlInput.includes('drive.google.com')) {
      const convertedUrl = convertGoogleDriveLink(urlInput);
      if (convertedUrl) {
        processedUrl = convertedUrl;
        
        // Test if the URL works, if not try alternatives
        const canLoad = await testImageLoad(processedUrl);
        if (!canLoad) {
          // Extract file ID and try alternative formats
          const fileIdMatch = urlInput.match(/\/file\/d\/([a-zA-Z0-9-_]+)|id=([a-zA-Z0-9-_]+)|\/d\/([a-zA-Z0-9-_]+)/);
          if (fileIdMatch) {
            const fileId = fileIdMatch[1] || fileIdMatch[2] || fileIdMatch[3];
            const alternatives = getAlternativeGoogleDriveFormats(fileId);
            
            // Try each alternative until one works
            for (const altUrl of alternatives) {
              const works = await testImageLoad(altUrl);
              if (works) {
                processedUrl = altUrl;
                break;
              }
            }
          }
        }
      }
    }
    
    // Check if S3 is configured and upload URL to S3
    if (validateS3Config()) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        // Upload URL to S3
        const s3Url = await uploadUrlToS3(processedUrl, (progress) => {
          setUploadProgress(progress);
        });
        
        setPreview(s3Url);
        onChange(s3Url);
      } catch (error) {
        console.error('S3 URL upload failed:', error);
        // Fallback to direct URL
        setPreview(processedUrl);
        onChange(processedUrl);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // Use direct URL if S3 not configured
      setPreview(processedUrl);
      onChange(processedUrl);
    }
    
    setUrlInput('');
  };

  const removeImage = () => {
    setPreview(null);
    setDisplayUrl(null);
    onChange('');
    setUrlInput('');
  };

  const isUrl = preview && (preview.startsWith('http') || preview.startsWith('https'));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={inputMode === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('upload')}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
          <Button
            type="button"
            variant={inputMode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('url')}
          >
            <Link className="h-3 w-3 mr-1" />
            URL
          </Button>
        </div>
      </div>
      
      {isUploading ? (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Uploading to S3... {uploadProgress}%
            </span>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      ) : preview ? (
        <div className="relative border-2 border-dashed border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {isUrl ? (preview.includes('s3') || preview.includes('amazonaws.com') ? 'Stored in S3' : 'External image linked') : 'Image uploaded'}
              </span>
              {isUrl && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeImage}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center">
            <img
              src={displayUrl || 'https://placehold.co/120x60?text=Loading...'}
              alt="Preview"
              className="max-h-32 max-w-full object-contain rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/120x60?text=Image+Error';
              }}
            />
          </div>
          {isUrl && (
            <p className="text-xs text-muted-foreground mt-2 break-all">
              {preview.length > 60 ? `${preview.substring(0, 60)}...` : preview}
            </p>
          )}
        </div>
      ) : (
        <>
          {inputMode === 'upload' ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragActive && "border-primary bg-primary/5",
                "hover:border-primary hover:bg-primary/5"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                {isDragActive ? (
                  <Upload className="h-8 w-8 text-primary" />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to select (PNG, JPG, max 5MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="imageUrl" className="text-sm">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://drive.google.com/... or any image URL"
                    className="mt-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleUrlSubmit();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  size="sm"
                  className="w-full"
                >
                  <Link className="h-3 w-3 mr-1" />
                  Add Image URL
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Supports Google Drive links, direct image URLs, and most image hosting services
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};