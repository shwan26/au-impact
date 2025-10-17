'use client';

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
  SAU_Name?: string | null;
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
  sauName?: string | null;
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
    sauName: r.SAU_Name ?? null,
    ausoId: r.AUSO_ID,
  };
}

export default function AUSOAnnouncementEditPage() {
  const params = useParams<{ id: string }>();
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  const idNum = useMemo(() => Number(idStr), [idStr]);

  const [item, setItem] = useState<UiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/announcements/${idNum}`, { cache: 'no-store' });
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Failed to load');
        const json = text ? (JSON.parse(text) as ApiRow) : null;
        if (!json) throw new Error('Not found');
        if (!cancelled) setItem(fromApi(json));

        
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idNum]);

  async function setStatus(newStatus: 'LIVE' | 'PENDING') {
    if (!item) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/announcements/${idNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Topic: item.topic,
          Description: item.description,
          PhotoURL: item.photoUrl,
          Status: newStatus, // send PascalCase keys
          SAU_ID: item.sauId,
          AUSO_ID: item.ausoId,
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Update failed');
      const json = text ? (JSON.parse(text) as ApiRow) : null;
      if (!json) throw new Error('Invalid response');
      setItem(fromApi(json));
      alert(newStatus === 'LIVE' ? 'Approved (LIVE)' : 'Marked PENDING');
    } catch (e: any) {
      setErr(e?.message || 'Update error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">Loading…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!item) return <div className="p-4">Announcement not found.</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Announcement</h1>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
          <div className="py-2 text-sm font-medium text-zinc-700">Activity Unit</div>
          <div className="py-2">{item.sauName || 'VMES Student Council'}</div>

          <div className="py-2 text-sm font-medium text-zinc-700">Announcement Number</div>
          <div className="py-2 font-mono">A{String(item.announcementId).padStart(6, '0')}</div>
        </div>

        <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
          <div className="py-2 text-sm font-medium text-zinc-700">Announcement Topic</div>
          <input readOnly value={item.topic} className="w-full max-w-xl rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50" />
        </div>

        <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
          <div className="py-2 text-sm font-medium text-zinc-700">Description</div>
          <textarea readOnly value={item.description ?? ''} rows={4} className="w-full max-w-xl rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50" />
        </div>

        <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
          <div className="py-2 text-sm font-medium text-zinc-700">Photo URL</div>
          <input readOnly value={item.photoUrl ?? ''} className="w-full max-w-xl rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50" />
        </div>

        <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
          <div className="py-2 text-sm font-medium text-zinc-700">Status</div>
          <input readOnly value={item.status} className="w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50" />
        </div>

        <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
          <div className="py-2 text-sm font-medium text-zinc-700">Actions</div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setStatus('LIVE')}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Approve (LIVE)'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setStatus('PENDING')}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Not approve (PENDING)'}
            </button>
            <Link href="/auso/announcements" className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50">
              Back
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
}
