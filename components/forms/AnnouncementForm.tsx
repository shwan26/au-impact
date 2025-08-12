'use client';
import { Announcement, Status } from '@/types/db';
import { useState } from 'react';

export default function AnnouncementForm({ initial }: { initial?: Announcement }) {
  const [form, setForm] = useState<Announcement>(
    initial ?? { id:'new', title:'', body:'', createdAt:new Date().toISOString(), status:'DRAFT' }
  );

  return (
    <form className="card" onSubmit={(e)=>e.preventDefault()}>
      <label>Title<br/><input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })}/></label>
      <label>Body<br/><textarea value={form.body} onChange={(e)=>setForm({ ...form, body: e.target.value })}/></label>
      <label>Status<br/>
        <select value={form.status} onChange={(e)=>setForm({ ...form, status: e.target.value as Status })}>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>
      </label>
      <div style={{height:8}}/>
      <button>Save (mock)</button>
    </form>
  );
}
