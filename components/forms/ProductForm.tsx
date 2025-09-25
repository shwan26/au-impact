'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Local type just for the form
type Product = {
  id: string;
  title: string;
  price: number;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
};

export default function ProductForm({ initial }: { initial?: Product }) {
  const [form, setForm] = useState<Product>(
    initial ?? {
      id: 'new',
      title: '',
      price: 0,
      description: '',
      status: 'DRAFT',
    }
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from('Merchandise').insert([
      {
        Title: form.title,
        Price: form.price,
        Description: form.description,
        // Map your draft/published form status to merch_status
        Status: form.status === 'DRAFT' ? 'PENDING' : 'APPROVED',
      },
    ]);

    if (error) {
      console.error(error);
      setMessage('❌ Failed to save: ' + error.message);
    } else {
      setMessage('✅ Product saved to Supabase!');
    }

    setSaving(false);
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        Title
        <br />
        <input
          className="border px-2 py-1 w-full"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </label>

      <label className="block">
        Price
        <br />
        <input
          type="number"
          className="border px-2 py-1 w-full"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: Number(e.target.value) })
          }
        />
      </label>

      <label className="block">
        Description
        <br />
        <textarea
          className="border px-2 py-1 w-full"
          value={form.description ?? ''}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
      </label>

      <label className="block">
        Status
        <br />
        <select
          className="border px-2 py-1 w-full"
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as Product['status'] })
          }
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}
