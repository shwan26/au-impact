// lib/uploadClient.ts
export type UploadKind = 'poster' | 'qr' | 'slip';

export async function uploadTo(kind: UploadKind, file: File, prefix?: string) {
  const fd = new FormData();
  fd.set('file', file);
  if (prefix) fd.set('prefix', prefix);

  const res = await fetch(`/api/uploads/${encodeURIComponent(kind)}`, {
    method: 'POST',
    body: fd,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Upload failed (${res.status})`);
  return json as {
    bucket: string;
    path: string;
    publicUrl: string;
    size: number;
    mime: string;
    name: string;
  };
}
