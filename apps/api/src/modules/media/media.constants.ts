import type { MediaResourceType } from './media.entity';

/** Single source of truth for upload size limits (bytes). */
export const MEDIA_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
} as const;

/** MIME type → CMS resource type. */
const RESOURCE_TYPE_BY_MIME: Record<string, MediaResourceType> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
};

/** MIME type → file format/extension. */
const FORMAT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

export const ALLOWED_MIME_TYPES = Object.keys(RESOURCE_TYPE_BY_MIME);

export const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'mp4',
  'webm',
] as const;

/** Multer hard cap = largest allowed media type. */
export const MEDIA_UPLOAD_MAX_BYTES = Math.max(MEDIA_LIMITS.image, MEDIA_LIMITS.video);

export function getResourceType(mimeType: string): MediaResourceType | null {
  return RESOURCE_TYPE_BY_MIME[mimeType] ?? null;
}

export function getFileFormat(mimeType: string): string | undefined {
  return FORMAT_BY_MIME[mimeType];
}

export function getMaxFileSize(resourceType: MediaResourceType): number {
  return MEDIA_LIMITS[resourceType];
}

/** Cloudinary folder for CMS uploads. */
export function getUploadFolder(userId: string): string {
  return `cms/media/${userId}`;
}
