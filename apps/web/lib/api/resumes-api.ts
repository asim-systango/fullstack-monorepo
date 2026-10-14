import { apiClient } from '@/lib/api/client';
import type { ResumeMeta, UploadSignaturePayload } from '@/lib/api/types';

export async function listResumes(): Promise<ResumeMeta[]> {
  const { data } = await apiClient.get<ResumeMeta[]>('/resumes');
  return data;
}

export async function getResume(id: string): Promise<ResumeMeta> {
  const { data } = await apiClient.get<ResumeMeta>(`/resumes/${id}`);
  return data;
}

export async function createResume(body: {
  url: string;
  label?: string;
  cloudinaryPublicId?: string;
}): Promise<ResumeMeta> {
  const { data } = await apiClient.post<ResumeMeta>('/resumes', body);
  return data;
}

export async function updateResume(
  id: string,
  body: { url?: string; label?: string },
): Promise<ResumeMeta> {
  const { data } = await apiClient.patch<ResumeMeta>(`/resumes/${id}`, body);
  return data;
}

export async function deleteResume(id: string): Promise<{ ok: true }> {
  const { data } = await apiClient.delete<{ ok: true }>(`/resumes/${id}`);
  return data;
}

export async function getUploadSignature(): Promise<UploadSignaturePayload> {
  const { data } = await apiClient.post<UploadSignaturePayload>(
    '/resumes/upload-signature',
  );
  return data;
}

/**
 * Direct browser → Cloudinary raw upload (no file bytes through our API).
 * Confirmed by CloudinaryService + job-portal-cloudinary-resume-upload-report.
 */
export async function uploadResumeToCloudinary(
  file: File,
  signature: UploadSignaturePayload,
): Promise<{ secure_url: string; public_id: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/raw/upload`,
    { method: 'POST', body: form },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Cloudinary upload failed');
  }

  const json = (await res.json()) as { secure_url: string; public_id: string };
  return { secure_url: json.secure_url, public_id: json.public_id };
}
