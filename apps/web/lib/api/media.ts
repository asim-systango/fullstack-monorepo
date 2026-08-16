import { apiClient } from './api-client';

export type MediaResourceType = 'image' | 'video';

export type UploadedMedia = {
  id: string;
  url: string;
  resourceType: MediaResourceType;
  format: string;
  width?: number | null;
  height?: number | null;
  bytes: number;
  durationSeconds?: number | null;
  altText?: string | null;
  createdAt: string;
};

/** Uploads a file to Cloudinary via the API and returns the media row to reference by `id`. */
export async function uploadMedia(file: File, altText?: string): Promise<UploadedMedia> {
  const form = new FormData();
  form.append('file', file);
  if (altText) {
    form.append('altText', altText);
  }

  const { data } = await apiClient.post<UploadedMedia>('/media', form, {
    timeout: 120_000,
  });
  return data;
}
