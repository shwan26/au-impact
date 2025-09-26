// lib/uploadClient.ts
export type UploadKind = 'poster' | 'qr' | 'slip';

// uploadClient.ts
export async function uploadTo(kind: UploadKind, file: File, prefix?: string) {
  const fd = new FormData();
  fd.append('file', file);
  if (prefix) fd.append('prefix', prefix);

  const res = await fetch(`/api/uploads/${kind}`, {
    method: 'POST',
    body: fd,               // IMPORTANT: do NOT set Content-Type manually
    // credentials: 'include', // not required for storage admin upload
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = (json && (json.error || json.message)) || `Upload failed (${res.status})`;
    throw new Error(msg);
  }
  return json as {
    bucket: string;
    path: string;
    publicUrl: string;
    size: number;
    mime: string;
    name: string;
  };
}
