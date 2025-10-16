'use client';
<<<<<<< HEAD
/* eslint-disable @next/next/no-img-element */
=======
>>>>>>> 97bd460cf094a4380cb3b7a5fa6c562d71094487
import type React from 'react';
import { errMsg } from '@/lib/errors';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

type Status = 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;

type ApiRow = {
  AnnouncementID: number;
  Topic: string;
  Description: string | null;
  PhotoURL: string | null;
  DatePosted: string;
  Status: Status;
  SAU_ID: number | null;
  AUSO_ID: number | null;
};

type UiRow = {
  announcementId: number;
  topic: string;
  description: string | null;
  photoUrl: string | null;
  datePosted: string;
  status: Status;
  sauId: number | null;
  ausoId: number | null;
};

function fromApi(r: ApiRow): UiRow {
  return {
    announcementId: r.AnnouncementID,
    topic: r.Topic,
    description: r.Description,
    photoUrl: r.PhotoURL,
    datePosted: r.DatePosted,
    status: r.Status,
    sauId: r.SAU_ID,
    ausoId: r.AUSO_ID,
  };
}

function RowBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function SAUEditAnnouncementPage() {
  const params = useParams<{ id: string }>();
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  const idNum = useMemo(() => Number(idStr), [idStr]);

  const [item, setItem] = useState<UiRow | null>(null);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/announcements/${idNum}`, { cache: 'no-store' });
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Failed to load');
        const json = text ? (JSON.parse(text) as ApiRow) : null;
        if (!json) throw new Error('Not found');
        const mapped = fromApi(json);
        if (!cancelled) {
          setItem(mapped);
          setTopic(mapped.topic ?? '');
          setDescription(mapped.description ?? '');
          setPhotoUrl(mapped.photoUrl ?? '');
        }
      } catch (e: unknown) {
        if (!cancelled) setErr(errMsg(e) || 'Error loading announcement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idNum]);

  async function save(newStatus: 'DRAFT' | 'PENDING') {
    if (!item) return;
    const locked = item.status === 'LIVE' || item.status === 'COMPLETE';
    if (locked) return; // safety

    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/announcements/${idNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // API expects PascalCase keys
          Topic: topic,
          Description: description || null,
          PhotoURL: photoUrl || null,
          Status: newStatus,
          SAU_ID: item.sauId,
          AUSO_ID: item.ausoId,
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Update failed');
      const json = text ? (JSON.parse(text) as ApiRow) : null;
      if (!json) throw new Error('Invalid response');
      const updated = fromApi(json);
      setItem(updated);
      setTopic(updated.topic ?? '');
      setDescription(updated.description ?? '');
      setPhotoUrl(updated.photoUrl ?? '');
      alert(newStatus === 'PENDING' ? 'Submitted for review.' : 'Saved as draft.');
    } catch (e: unknown) {
      setErr(errMsg(e) || 'Update error');
    } finally {
      setSaving(false);
    }
  }

  if (!Number.isFinite(idNum)) return <div className="p-6 text-red-600">Invalid announcement id.</div>;
  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!item) return <div className="p-6">Announcement not found.</div>;

  const locked = item.status === 'LIVE' || item.status === 'COMPLETE';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Announcement</h1>
        <Link
          href="/sau/announcements"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
        >
          Back to List
        </Link>
      </div>

      {locked && (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          This announcement is approved and read-only.
        </div>
      )}

      <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
        <div className="py-2 text-sm font-medium text-zinc-700">Activity Unit</div>
        <div className="py-2">Student Council of Theodore Maria School of Arts</div>

        <div className="py-2 text-sm font-medium text-zinc-700">Announcement Number</div>
        <div className="py-2 font-mono">A{String(item.announcementId).padStart(6, '0')}</div>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <RowBox label="Announcement Topic">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            readOnly={locked}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${locked ? 'bg-zinc-50' : ''}`}
          />
        </RowBox>

        <RowBox label="Description">
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            readOnly={locked}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${locked ? 'bg-zinc-50' : ''}`}
          />
        </RowBox>

        <RowBox label="Overview Photo URL">
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            readOnly={locked}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${locked ? 'bg-zinc-50' : ''}`}
            placeholder="https://…"
          />
        </RowBox>

        {/* NEW: Upload Photo */}
        <RowBox label="Upload Photo">
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              disabled={uploading || locked}
              className="block w-full max-w-xs text-sm"
              onChange={async (e) => {
                const file = e.currentTarget.files?.[0];
                if (!file || !item) return;
                try {
                  setUploading(true);
                  const fd = new FormData();
                  fd.append('file', file);
                  const res = await fetch(`/api/announcements/${item.announcementId}/photo`, {
                    method: 'POST',
                    body: fd,
                  });
                  const text = await res.text();
                  if (!res.ok) {
                    try {
                      const j = text ? JSON.parse(text) : null;
                      throw new Error((j && j.error) || text || 'Upload failed');
                    } catch {
                      throw new Error(text || 'Upload failed');
                    }
                  }
                  const updated = text ? (JSON.parse(text) as ApiRow) : null;
                  if (!updated) throw new Error('Invalid response');
                  // sync local state
                  setPhotoUrl(updated.PhotoURL ?? '');
                  setItem((prev) => (prev ? { ...prev, photoUrl: updated.PhotoURL ?? null } : prev));
                  // clear file input
                  e.currentTarget.value = '';
                } catch (err: unknown) {
                  alert(err?.message || 'Upload failed');
                } finally {
                  setUploading(false);
                }
              }}
            />
            <div className="text-xs text-zinc-500">
              {uploading ? 'Uploading…' : locked ? 'Uploads disabled after approval' : 'JPG/PNG recommended.'}
            </div>

            {photoUrl && (
              <div className="mt-2 overflow-hidden rounded border border-zinc-200">
/* eslint-disable-next-line @next/next/no-img-element */
                <img src={photoUrl} alt="Announcement photo" className="h-auto w-full object-cover" />
              </div>
            )}
          </div>
        </RowBox>

        <RowBox label="Status">
          <input
            readOnly
            value={item.status}
            className="w-full max-w-xs rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm"
          />
        </RowBox>

        {/* Actions */}
        {!locked ? (
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => save('PENDING')}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Submit for review (PENDING)'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save('DRAFT')}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save draft (DRAFT)'}
            </button>
          </div>
        ) : (
          <div className="pt-2 text-sm text-zinc-600">No further edits from SAU after approval.</div>
        )}
      </form>
    </div>
  );
}
