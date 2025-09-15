'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getFundraisingById } from '@/lib/mock';

type Donation = {
  name: string;   // "Anonymous" or nickname
  amount: number; // THB
  at: string;     // ISO date string
  slip?: string;  // URL to receipt/slip (optional)
};

function makeFallbackDonations(id: string): Donation[] {
  const base = (parseInt(id.replace(/\D/g, ''), 10) || 7) % 5; // 0..4
  const n = 6 + base; // 6..10 rows
  const list: Donation[] = [];
  for (let i = 0; i < n; i++) {
    const amt = 100 * ((i % 5) + 1);
    list.push({
      name: i % 3 === 0 ? 'Anonymous' : `Donor ${i + 1}`,
      amount: amt,
      at: new Date(Date.now() - i * 86400000).toISOString(),
      // every other row gets a real-looking receipt URL; others show "—"
      slip: i % 2 === 0 ? `https://example.org/receipt/${id}/${i + 1}` : '',
    });
  }
  return list;
}

export default function SAUFundraisingListPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const f = getFundraisingById(id);
  if (!f) return <div className="p-6">Fundraising not found.</div>;

  // If you later have an API, fetch it here; otherwise we show the fallback.
  const donations = makeFallbackDonations(id);

  const fmtTHB = (n: number) => n.toLocaleString('en-US');
  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Fundraising List</h1>
        <Link
          href={`/sau/fundraising/${id}`}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
        >
          Back to Edit
        </Link>
      </div>

      <p className="text-sm text-zinc-700">
        <span className="font-medium">Project:</span> {f.title}
      </p>

      <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">No.</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Donor</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Amount (THB)</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Date &amp; Time</th>
              <th className="px-4 py-3 text-left font-semibold">Receipt URL</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d, i) => (
              <tr key={i} className="border-b border-zinc-200 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-200">{i + 1}.</td>
                <td className="px-4 py-3 border-r border-zinc-200">{d.name || 'Anonymous'}</td>
                <td className="px-4 py-3 border-r border-zinc-200">{fmtTHB(d.amount)}</td>
                <td className="px-4 py-3 border-r border-zinc-200">{fmtDateTime(d.at)}</td>
                <td className="px-4 py-3">
                  {d.slip ? (
                    <a
                      href={d.slip}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}

            {!donations.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  No donations recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
