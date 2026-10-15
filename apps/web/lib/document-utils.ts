import { apiClient } from '@/lib/api';

/**
 * Normalizes document URLs to ensure Cloudinary PDFs use /raw/upload/
 * instead of /image/upload/, which fails to render as PDFs in standard browsers.
 */
export function normalizeDocumentUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  if (cleaned.includes('res.cloudinary.com') && cleaned.endsWith('.pdf')) {
    if (cleaned.includes('/image/upload/')) {
      cleaned = cleaned.replace('/image/upload/', '/raw/upload/');
    }
  }
  return cleaned;
}

/**
 * Open a document URL in a new browser tab for viewing / previewing.
 */
export function viewDocument(rawUrl: string) {
  if (!rawUrl) return;
  const url = normalizeDocumentUrl(rawUrl);

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const isFilePath =
    url.startsWith('/') ||
    url.startsWith('objects/') ||
    url.startsWith('uploads/') ||
    /\.(pdf|png|jpg|jpeg|webp|doc|docx|txt)$/i.test(url);

  if (!isFilePath) {
    // Plain text credential identifier (e.g. license number) — open text data URI preview
    const textDataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(
      `Credential Record:\n${url}`,
    )}`;
    window.open(textDataUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  let fullUrl = url;
  if (
    !fullUrl.startsWith('/') &&
    !fullUrl.startsWith('objects/') &&
    !fullUrl.startsWith('uploads/') &&
    !fullUrl.startsWith('api/')
  ) {
    fullUrl = `/objects/${fullUrl}`;
  } else if (!fullUrl.startsWith('/')) {
    fullUrl = `/${fullUrl}`;
  }

  if (!fullUrl.startsWith('/api')) {
    fullUrl = `/api${fullUrl}`;
  }

  window.open(fullUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Securely download a document by fetching its binary content via apiClient
 * (with Auth credentials) or triggering a native browser download for external links.
 */
export async function downloadDocument(docName: string, rawUrl: string) {
  if (!rawUrl) return;
  const url = normalizeDocumentUrl(rawUrl);

  // External HTTP/HTTPS links (e.g. seeded sample URLs or Cloudinary CDN links)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = docName || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Data or blob URLs
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = docName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const isFilePath =
    url.startsWith('/') ||
    url.startsWith('objects/') ||
    url.startsWith('uploads/') ||
    /\.(pdf|png|jpg|jpeg|webp|doc|docx|txt)$/i.test(url);

  if (!isFilePath) {
    // Plain text credential identifier — download as text file
    const textBlob = new Blob([`Credential Record: ${url}`], {
      type: 'text/plain;charset=utf-8',
    });
    const blobUrl = window.URL.createObjectURL(textBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${(docName || 'credential').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return;
  }

  // Relative API paths for internal Object Storage (e.g. /objects/123 or objects/123)
  let endpoint = url;
  if (endpoint.startsWith('/api')) {
    endpoint = endpoint.replace('/api', '');
  }
  if (
    !endpoint.startsWith('/') &&
    !endpoint.startsWith('objects/') &&
    !endpoint.startsWith('uploads/')
  ) {
    endpoint = `/objects/${endpoint}`;
  } else if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }

  try {
    const response = await apiClient.get(endpoint, {
      responseType: 'blob',
      suppressSuccessToast: true,
      suppressErrorToast: true,
    } as unknown as Record<string, unknown>);

    const rawContentType = response.headers['content-type'];
    const contentType =
      typeof rawContentType === 'string' ? rawContentType : 'application/octet-stream';
    const blob = new Blob([response.data as BlobPart], { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = docName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.warn('Blob download failed, falling back to viewDocument:', err);
    viewDocument(url);
  }
}
