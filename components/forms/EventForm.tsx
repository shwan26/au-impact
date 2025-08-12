'use client';
import { Event, Status } from '@/types/db';
import { useState } from 'react';

export default function EventForm({ initial }: { initial?: Event }) {
  const [form, setForm] = useState<Event>(
    initial ?? { id: 'new', title: '', date: new Date().toISOString(), summary: '', description: '', status: 'DRAFT' }
  );

  return (
    <form className="card" onSubmit={(e) => e.preventDefault()}>
      <label>Title<br/><input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })}/></label>
      <label>Date<br/><input type="date" value={form.date.slice(0,10)} onChange={(e)=>setForm({ ...form, date: new Date(e.target.value).toISOString() })}/></label>
      <label>Summary<br/><input value={form.summary} onChange={(e)=>setForm({ ...form, summary: e.target.value })}/></label>
      <label>Description<br/><textarea value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })}/></label>
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
