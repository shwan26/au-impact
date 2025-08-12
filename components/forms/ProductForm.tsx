'use client';
import { Product, Status } from '@/types/db';
import { useState } from 'react';

export default function ProductForm({ initial }: { initial?: Product }) {
  const [form, setForm] = useState<Product>(
    initial ?? { id: 'new', title: '', price: 0, description: '', status: 'DRAFT' }
  );

  return (
    <form className="card" onSubmit={(e)=>e.preventDefault()}>
      <label>Title<br/><input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })}/></label>
      <label>Price<br/><input type="number" value={form.price} onChange={(e)=>setForm({ ...form, price: Number(e.target.value) })}/></label>
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
