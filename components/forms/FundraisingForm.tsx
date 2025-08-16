'use client';
import { Fundraising, Status } from '@/types/db';
import { useState } from 'react';

export default function FundraisingForm({ initial }: { initial?: Fundraising }) {
  const [form, setForm] = useState<Fundraising>(
    initial ?? { id: 'new', title: '', goal: 0, summary: '', description: '', status: 'DRAFT' as Status }
  );

  return (
    <form className="card" onSubmit={(e)=>e.preventDefault()}>
      <label>Title<br/><input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })}/></label>
      <label>Goal<br/><input type="number" value={form.goal} onChange={(e)=>setForm({ ...form, goal: Number(e.target.value) })}/></label>
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
