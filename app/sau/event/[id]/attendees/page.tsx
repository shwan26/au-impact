// app/components/events/EventAttendees.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useJson } from '@/hooks/useJson';

type RegItem = {
  studentId: string;
  name: string;
  phone: string;
  attended?: boolean;
};
type ApiRegs = { staff: RegItem[]; participants: RegItem[] };

function fallbackRegs(key: string): ApiRegs {
  const base = (parseInt(String(key).replace(/\D/g, ''), 10) || 1) % 3;
  const mk = (n: number): RegItem => ({
    studentId: `66${(n + 1).toString().padStart(6, '0')}`,
    name: `Student ${n + 1}`,
    phone: `08${(10000000 + n * 1357).toString().slice(0, 8)}`,
    attended: n % 2 === 0,
  });
  const staffCount = 2 + base;
  const partCount = 5 + base * 2;
  return {
    staff: Array.from({ length: staffCount }, (_, i) => mk(i)),
    participants: Array.from({ length: partCount }, (_, i) => mk(i + 10)),
  };
}

export default function EventAttendees({
  eventId,
  className,
}: {
  eventId: string | number;
  className?: string;
}) {
  const { data, loading, error } = useJson<ApiRegs>(`/api/events/${eventId}/registrations`);

  // ✅ Only fall back if the object is missing or malformed.
  const initialRegs: ApiRegs = useMemo(() => {
    if (data && Array.isArray(data.staff) && Array.isArray(data.participants)) {
      return data;
    }
    return fallbackRegs(String(eventId));
  }, [data, eventId]);

  const [staff, setStaff] = useState<RegItem[]>(initialRegs.staff);
  const [participants, setParticipants] = useState<RegItem[]>(initialRegs.participants);

  useEffect(() => {
    setStaff(initialRegs.staff);
    setParticipants(initialRegs.participants);
  }, [initialRegs]);

  const onToggle = (kind: 'staff' | 'participants', idx: number, checked: boolean) => {
    if (kind === 'staff') {
      setStaff((list) => list.map((r, i) => (i === idx ? { ...r, attended: checked } : r)));
    } else {
      setParticipants((list) =>
        list.map((r, i) => (i === idx ? { ...r, attended: checked } : r))
      );
    }
  };

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  async function onSave() {
    try {
      setSaving(true);
      setSaveErr(null);
      setSaveOk(false);

      const res = await fetch(`/api/events/${eventId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff, participants }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error((json as any)?.error || 'Failed to save registrations');

      setSaveOk(true);
    } catch (e: any) {
      setSaveErr(e?.message || 'Error while saving');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={className ?? 'p-6'}>
      <h2 className="text-xl font-bold">Attendees</h2>

      {loading && <p className="mt-2 text-sm text-zinc-600">Loading…</p>}

      {/* Staff */}
      <section className="mt-6 space-y-2" aria-label="Staff">
        <div className="flex flex-wrap items-baseline gap-4">
          <h3 className="text-lg font-semibold">Staff</h3>
          <div className="text-sm text-zinc-600">
            Total: <span className="font-medium text-zinc-900">{staff.length}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                {['No.', 'Name', 'StudentID', 'Phone No.', 'Attended'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-left font-semibold ${
                      i < 4 ? 'border-r border-zinc-300' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((r, i) => (
                <tr
                  key={`${r.studentId || 'idless'}-staff-${i}`}
                  className="border-b border-zinc-200 last:border-b-0"
                >
                  <td className="px-3 py-2 border-r border-zinc-200">{i + 1}.</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.name}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.studentId}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.phone}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!r.attended}
                        onChange={(e) => onToggle('staff', i, e.target.checked)}
                        aria-label={`Staff ${r.name} attended`}
                      />
                      <span className="sr-only">Attended</span>
                    </label>
                  </td>
                </tr>
              ))}
              {!staff.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-zinc-500" colSpan={5}>
                    No staff registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Participants */}
      <section className="mt-8 space-y-2" aria-label="Participants">
        <div className="flex flex-wrap items-baseline gap-4">
          <h3 className="text-lg font-semibold">Participants</h3>
          <div className="text-sm text-zinc-600">
            Total: <span className="font-medium text-zinc-900">{participants.length}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                {['No.', 'Name', 'StudentID', 'Phone No.', 'Attended'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-left font-semibold ${
                      i < 4 ? 'border-r border-zinc-300' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((r, i) => (
                <tr
                  key={`${r.studentId || 'idless'}-participant-${i}`}
                  className="border-b border-zinc-200 last:border-b-0"
                >
                  <td className="px-3 py-2 border-r border-zinc-200">{i + 1}.</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.name}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.studentId}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.phone}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!r.attended}
                        onChange={(e) => onToggle('participants', i, e.target.checked)}
                        aria-label={`Participant ${r.name} attended`}
                      />
                      <span className="sr-only">Attended</span>
                    </label>
                  </td>
                </tr>
              ))}
              {!participants.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-zinc-500" colSpan={5}>
                    No participants registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Save + messages */}
      <div className="mt-6 space-y-3">
        <button
          onClick={onSave}
          disabled={saving}
          aria-busy={saving}
          className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        {error && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
            Couldn’t fetch from <code>/api/events/{String(eventId)}/registrations</code>. Showing fallback data.
          </div>
        )}
        {saveErr && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {saveErr}
          </div>
        )}
        {saveOk && !saveErr && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
            Attendance saved.
          </div>
        )}
      </div>
    </div>
  );
}