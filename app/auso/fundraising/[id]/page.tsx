'use client';

import { useRouter, useParams } from 'next/navigation';
import { getFundraisingById } from '@/lib/mock';

function toProjectNumber(id: string) {
  const digits = id.replace(/\D/g, '').padStart(6, '0') || '000000';
  return `F${digits}`;
}

export default function AUSOEditFundraisingPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const item = getFundraisingById(id);
  if (!item) return <div className="p-6">Fundraising not found.</div>;

  const projectNumber = toProjectNumber(id);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert('Saved (demo).');
  }
  function approve() {
    alert('Marked as Approved (demo).');
    router.push('/auso/fundraising');
  }
  function notApprove() {
    alert('Marked as Not Approved (demo).');
    router.push('/auso/fundraising');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-extrabold">Fundraising</h1>

      {/* Meta */}
      <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
        <div className="py-2 text-sm font-medium text-zinc-700">Activity Unit</div>
        <div className="py-2">Student Council of Theodore Maria School of Arts</div>

        <div className="py-2 text-sm font-medium text-zinc-700">Project Number</div>
        <div className="py-2 font-mono">{projectNumber}</div>
      </div>

      {/* Edit form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <Row label="Project Name">
          <input
            defaultValue={item.title}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Organizer Name">
          <input
            defaultValue={item.organizerName ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Organizer LineID">
          <input
            defaultValue={item.contactLine ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Event Venue">
          <input
            defaultValue={item.location ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Event Date From / To">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              defaultValue={item.startDate?.slice(0, 10)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
            />
            <input
              type="date"
              defaultValue={item.endDate?.slice(0, 10)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
            />
          </div>
        </Row>

        <Row label="Expected Money Amount (THB)">
          <input
            type="number"
            min={0}
            defaultValue={item.goal}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Write Caption">
          <textarea
            rows={4}
            defaultValue={item.description ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Bank Book Name">
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none" />
        </Row>
        <Row label="Bank Book Account">
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none" />
        </Row>
        <Row label="Bank Name">
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none" />
        </Row>

        <Row label="PromptPay QR code">
          <div className="rounded-md border bg-zinc-50 p-8 text-center text-sm text-zinc-500">
            Upload / manage QR here (UI only)
          </div>
        </Row>

        <Row label="Upload Poster">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>Upload .png, .jpg, .jpeg (up to 5 photos)</span>
            <input type="file" accept="image/png,image/jpeg" multiple className="hidden" />
          </label>
        </Row>

        {/* Status row with Approve / Not Approve */}
        <Row label="Status">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={approve}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={notApprove}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Not Approve
            </button>
          </div>
        </Row>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/auso/fundraising')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="ml-auto rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-800 hover:bg-zinc-300"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
