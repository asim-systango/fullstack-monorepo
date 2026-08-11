import { useState, useCallback } from 'react';

interface UploadMetadata {
  name: string;
  size?: number;
  contentType?: string;
}

interface UploadResponse {
  uploadURL: string;
  objectPath: string;
  metadata: UploadMetadata;
}

interface UseUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const requestUploadUrl = useCallback(async (file: File): Promise<UploadResponse> => {
    const response = await fetch('/api/uploads/request-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to get upload URL');
    }

    return response.json();
  }, []);

  const uploadToPresignedUrl = useCallback(
    async (file: File, uploadURL: string): Promise<void> => {
      let targetUrl = uploadURL;
      if (!uploadURL.startsWith('http') && !uploadURL.startsWith('/api')) {
        targetUrl = `/api${uploadURL.startsWith('/') ? '' : '/'}${uploadURL}`;
      }
      const response = await fetch(targetUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to storage');
      }
    },
    [],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(10);

      try {
        const uploadResponse = await requestUploadUrl(file);
        setProgress(50);
        await uploadToPresignedUrl(file, uploadResponse.uploadURL);
        setProgress(100);

        options.onSuccess?.(uploadResponse);
        return uploadResponse;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Upload failed');
        setError(errorObj);
        options.onError?.(errorObj);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [requestUploadUrl, uploadToPresignedUrl, options],
  );

  return {
    uploadFile,
    isUploading,
    error,
    progress,
  };
}
