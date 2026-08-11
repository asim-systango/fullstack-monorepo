'use client';

import React, { useRef } from 'react';
import { Button } from '@shared/ui';
import { Upload, Loader2 } from 'lucide-react';
import { useUpload } from '../../lib/hooks/use-upload';

interface ObjectUploaderProps {
  onUploadSuccess?: (objectPath: string) => void;
  accept?: string;
  buttonText?: string;
  className?: string;
}

export function ObjectUploader({
  onUploadSuccess,
  accept = 'image/*,.pdf,.doc,.docx',
  buttonText = 'Upload Document / Image',
  className,
}: Readonly<ObjectUploaderProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (res) => {
      if (onUploadSuccess) {
        onUploadSuccess(res.objectPath);
      }
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>
    </div>
  );
}
