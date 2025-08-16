'use client';
import { useState } from 'react';
import type { Event, Status } from '@/types/db';

function newEvent(): Event {
  return {
    id: 'new',
    title: '',
    date: new Date().toISOString(),
    summary: '',
    description: '',
    status: 'DRAFT' as Status,
  };
}

function toLocalDatetimeInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`; // for <input type="datetime-local">
}

export default function EventForm({ initial }: { initial?: Event }) {
  const [form, setForm] = useState<Event>(() => initial ?? newEvent());

  // UI default only; don't force it into state until user picks one
  const uiStatus = (form.status ?? 'DRAFT') as Status;

  return (
    <form className="card" onSubmit={(e) => e.preventDefault()}>
      <label>
        Title
        <br />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </label>

      <label>
        Date/Time
        <br />
        <input
          type="datetime-local"
          value={toLocalDatetimeInput(form.date)}
          onChange={(e) => {
            const iso = new Date(e.target.value).toISOString();
            setForm({ ...form, date: iso });
          }}
        />
      </label>

      <label>
        Summary
        <br />
        <input
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
      </label>

      <label>
        Description
        <br />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>

      <label>
        Status
        <br />
        <select
          value={uiStatus}
          onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
        >
          <option value="DRAFT">DRAFT</option>
          <option value="PENDING">PENDING</option>
          <option value="LIVE">LIVE</option>
        </select>
      </label>

      <div style={{ height: 8 }} />
      <button>Save (mock)</button>
    </form>
  );
}
