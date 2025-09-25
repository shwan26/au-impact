'use client';

import { useRouter } from 'next/navigation';

type Props = {
  eventId: string;
  // null/undefined = unlimited; 0 = closed; >0 = open
  openStaff: number | null | undefined;
  openParticipants: number | null | undefined;
};

export default function RegisterButtons({ eventId, openStaff, openParticipants }: Props) {
  const router = useRouter();

  const cls =
    'rounded-lg bg-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50';

  const staffDisabled = openStaff === 0;                // only 0 disables
  const participantDisabled = openParticipants === 0;   // only 0 disables

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className={cls}
        disabled={staffDisabled}
        onClick={() => router.push(`/public/event/${eventId}/register/staff`)}
      >
        Register as Staff
      </button>
      <button
        className={cls}
        disabled={participantDisabled}
        onClick={() => router.push(`/public/event/${eventId}/register/participant`)}
      >
        Register as Participant
      </button>
    </div>
  );
}
