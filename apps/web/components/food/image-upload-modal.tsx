'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';
import {
  uploadImageToCloudinary,
  validateImageFile,
  type CloudinaryUploadFolder,
} from '@/lib/cloudinary';

type ImageUploadModalProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: CloudinaryUploadFolder;
  title?: string;
  disabled?: boolean;
  onUploaded: (url: string) => void | Promise<void>;
  onError?: (message: string) => void;
}>;

export function ImageUploadModal({
  open,
  onOpenChange,
  folder,
  title = 'Upload photo',
  disabled = false,
  onUploaded,
  onError,
}: ImageUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setDragOver(false);
      setUploading(false);
    }
  }, [open]);

  function close() {
    onOpenChange(false);
  }

  function pickFile(file: File | undefined) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    pickFile(e.dataTransfer.files?.[0]);
  }

  async function handleUpload() {
    if (!selectedFile || uploading || disabled) return;

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(selectedFile, folder);
      await onUploaded(url);
      close();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed';
      onError?.(message);
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={close}
    >
      <div
        className="tg-card tg-fade-in"
        style={{ width: '100%', maxWidth: 480, padding: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--tg-text)' }}>
            {title}
          </p>
          <button type="button" className="tg-btn tg-btn-ghost tg-btn-sm" onClick={close}>
            <X size={14} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={disabled || uploading}
          onChange={(e) => {
            pickFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!disabled && !uploading) setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !uploading) setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !uploading) inputRef.current?.click();
          }}
          style={{
            border: `2px dashed ${dragOver ? 'var(--tg-brand)' : 'var(--tg-border)'}`,
            borderRadius: 14,
            background: dragOver ? 'var(--tg-brand-soft)' : 'var(--tg-surface-muted)',
            padding: previewUrl ? 14 : 28,
            textAlign: 'center',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected preview"
              style={{
                width: '100%',
                maxHeight: 220,
                objectFit: 'cover',
                borderRadius: 10,
                display: 'block',
              }}
            />
          ) : (
            <>
              <ImagePlus
                size={28}
                color="var(--tg-text-faint)"
                style={{ margin: '0 auto 10px', display: 'block' }}
              />
              <p style={{ margin: 0, fontSize: 14, color: 'var(--tg-text)' }}>
                Drag and drop an image here
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--tg-text-muted)' }}>
                or click to browse · JPEG, PNG, WebP · max 5 MB
              </p>
            </>
          )}
        </div>

        {selectedFile ? (
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 13,
              color: 'var(--tg-text)',
              wordBreak: 'break-all',
            }}
          >
            Selected: <strong>{selectedFile.name}</strong>
          </p>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <button type="button" className="tg-btn tg-btn-ghost" disabled={uploading} onClick={close}>
            Cancel
          </button>
          <button
            type="button"
            className="tg-btn tg-btn-primary"
            disabled={!selectedFile || uploading || disabled}
            onClick={() => void handleUpload()}
          >
            {uploading ? (
              <>
                <Loader2 size={14} style={{ animation: 'tg-spin 0.7s linear infinite' }} /> Uploading…
              </>
            ) : (
              <>
                <Upload size={14} /> Upload photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
