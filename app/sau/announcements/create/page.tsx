'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; // browser client

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function SAUNewAnnouncementPage() {
  const router = useRouter();
  const supabase = createClient();

  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [photourl, setPhotourl] = useState('');
  const [sauName, setSauName] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load SAU name directly from Supabase
  useEffect(() => {
  let alive = true;
  (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: sauRow } = await supabase
        .from('sau')
        .select('name')       // <-- exact-case quotes
        .eq('auth_uid', user!.id)
        .maybeSingle();

      setSauName(sauRow?.name ?? null);

    } catch {
      if (alive) setSauName(null);
    }
  })();

  return () => { alive = false; };
  // do NOT depend on supabase instance; it’s stable from your factory
}, []);


  async function submit(status: 'DRAFT' | 'PENDING') {
    try {
      setSaving(true);
      setErr(null);

      const trimmed = topic.trim();
      if (!trimmed) {
        setErr('Topic is required');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',      
        body: JSON.stringify({
          Topic: trimmed,
          Description: description || null,
          PhotoURL: photourl || null,
          Status: status,
        }),
      });

      // Safely parse response (handles 405/empty body)
      const text = await res.text();
      const json = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;

      if (!res.ok) {
        const msg = (json && (json.error || json.message)) || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      alert(status === 'PENDING' ? 'Submitted for review.' : 'Saved as draft.');
      router.push('/sau/announcements');
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Create error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-extrabold">Announcement</h1>

      {err && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <Row label="Activity Unit">
        <div className="py-2">{sauName ?? '—'}</div>
      </Row>

      <Row label="Announcement Topic">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="Topic"
          required
        />
      </Row>

      <Row label="Description">
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="Describe your announcement"
        />
      </Row>

      <Row label="Overview Photo URL">
        <input
          value={photourl}
          onChange={(e) => setPhotourl(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="https://…"
          inputMode="url"
        />
      </Row>

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={saving}
          onClick={() => submit('PENDING')}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Submit for review (PENDING)'}
        </button>
      
      </div>
    </div>
  );
}
