import { unwrapData } from '@shared/api-client';
import { apiClient } from '@/lib/api';

export type CloudinaryUploadFolder = 'restaurants' | 'menu-items';

export type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

type CloudinaryUploadResponse = {
  secure_url: string;
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Use a JPEG, PNG, or WebP image';
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be 5 MB or smaller';
  }
  return null;
}

async function getCloudinarySignature(folder: CloudinaryUploadFolder): Promise<CloudinarySignature> {
  return apiClient
    .get('/uploads/cloudinary-signature', { params: { folder } })
    .then((res) => unwrapData<CloudinarySignature>(res.data));
}

export async function uploadImageToCloudinary(
  file: File,
  folder: CloudinaryUploadFolder,
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const signature = await getCloudinarySignature(folder);
  const body = new FormData();
  body.append('file', file);
  body.append('api_key', signature.apiKey);
  body.append('timestamp', String(signature.timestamp));
  body.append('signature', signature.signature);
  body.append('folder', signature.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: 'POST', body },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    try {
      const parsed = JSON.parse(detail) as { error?: { message?: string } };
      const message = parsed.error?.message ?? '';
      if (message.includes('Invalid cloud_name')) {
        throw new Error(
          'Cloudinary cloud name is invalid. Set CLOUDINARY_CLOUD_NAME in apps/api/.env to the exact Cloud name from your Cloudinary dashboard (Dashboard → Product environment credentials), then restart the API.',
        );
      }
      if (message) throw new Error(message);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Cloudinary cloud name')) throw err;
      if (err instanceof Error && !detail.startsWith('{')) throw err;
    }
    throw new Error(detail || 'Image upload failed');
  }

  const payload = (await response.json()) as CloudinaryUploadResponse;
  if (!payload.secure_url) {
    throw new Error('Image upload did not return a URL');
  }

  return payload.secure_url;
}
