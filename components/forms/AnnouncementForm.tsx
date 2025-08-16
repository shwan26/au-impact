'use client';
import { useState } from 'react';
import type { Announcement, Status } from '@/types/db';

function newAnnouncement(): Announcement {
  return {
    id: 'new',
    topic: '',
    description: '',
    datePosted: new Date().toISOString(),
    status: 'DRAFT' as Status,
  };
}

export default function AnnouncementForm({ initial }: { initial?: Announcement }) {
  const [form, setForm] = useState<Announcement>(() => initial ?? newAnnouncement());

  return (
    <form className="card" onSubmit={(e) => e.preventDefault()}>
      <label>
        Title
        <br />
        <input
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />
      </label>

      <label>
        Body
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
          value={form.status}
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
