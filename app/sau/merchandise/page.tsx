"use client";

import Link from "next/link";
import { useJson } from "@/hooks/useJson";

type Row = {
  ItemID: number;
  Title: string;
  Status?: string | null;
};

type ApiShape = { items: Row[] };

export default function SAUMerchandisePage() {
  const { data, loading, error } = useJson<ApiShape>("/api/merchandise");
  const items = data?.items ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Merchandise</h1>
        <Link
          href="/sau/merchandise/create"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          + New Merchandise
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          Couldn’t reach <code>/api/merchandise</code>.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                Project Number
              </th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                Merchandise Name
              </th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-zinc-900">
            {loading && !data ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            ) : items.length ? (
              items.map((m) => (
                <tr key={m.ItemID} className="border-b border-zinc-300 last:border-b-0">
                  <td className="px-4 py-3 border-r border-zinc-300 font-mono">
                    {m.ItemID}
                  </td>
                  <td className="px-4 py-3 border-r border-zinc-300">
                    <Link
                      href={`/sau/merchandise/${m.ItemID}`}
                      className="underline hover:no-underline"
                    >
                      {m.Title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{m.Status ?? "PENDING"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  No merchandise found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
