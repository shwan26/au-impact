'use client';

import { useRouter } from 'next/navigation';

type Props = {
  eventId: string;
  openStaff: number;
  openParticipants: number;
};

export default function RegisterButtons({ eventId, openStaff, openParticipants }: Props) {
  const router = useRouter();
  const cls =
    'rounded-lg bg-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className={cls}
        disabled={openStaff <= 0}
        onClick={() => router.push(`/public/event/${eventId}/register/staff`)}
      >
        Register as Staff
      </button>
      <button
        className={cls}
        disabled={openParticipants <= 0}
        onClick={() => router.push(`/public/event/${eventId}/register/participant`)}
      >
        Register as Participant
      </button>
    </div>
  );
}
