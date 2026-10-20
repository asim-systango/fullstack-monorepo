'use client';

import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import type { CloudinaryUploadFolder } from '@/lib/cloudinary';
import { FoodImage } from './food-image';
import { ImageUploadModal } from './image-upload-modal';

type ImageUploadProps = Readonly<{
  folder: CloudinaryUploadFolder;
  imageUrl?: string | null;
  emoji?: string | null;
  alt: string;
  label?: string;
  modalTitle?: string;
  size?: number;
  variant?: 'avatar' | 'hero';
  heroHeight?: number;
  disabled?: boolean;
  onUploaded: (url: string) => void | Promise<void>;
  onError?: (message: string) => void;
}>;

export function ImageUpload({
  folder,
  imageUrl,
  emoji,
  alt,
  label = 'Upload photo',
  modalTitle,
  size = 54,
  variant = 'avatar',
  heroHeight = 160,
  disabled = false,
  onUploaded,
  onError,
}: ImageUploadProps) {
  const [open, setOpen] = useState(false);

  if (variant === 'hero') {
    return (
      <>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          style={{
            display: 'block',
            width: '100%',
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <FoodImage
            imageUrl={imageUrl}
            emoji={emoji}
            alt={alt}
            variant="hero"
            height={heroHeight}
            borderRadius={14}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              gap: 6,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <ImagePlus size={16} /> {label}
          </span>
        </button>
        <ImageUploadModal
          open={open}
          onOpenChange={setOpen}
          folder={folder}
          title={modalTitle ?? label}
          disabled={disabled}
          onUploaded={onUploaded}
          onError={onError}
        />
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <FoodImage imageUrl={imageUrl} emoji={emoji} alt={alt} size={size} />
        <button
          type="button"
          className="tg-btn tg-btn-secondary tg-btn-sm"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          <ImagePlus size={13} /> {label}
        </button>
      </div>
      <ImageUploadModal
        open={open}
        onOpenChange={setOpen}
        folder={folder}
        title={modalTitle ?? label}
        disabled={disabled}
        onUploaded={onUploaded}
        onError={onError}
      />
    </>
  );
}
