'use client';

import Box from '@mui/material/Box';
import type { Announcement } from '@/types/db';
import AnnouncementCard from '@/components/cards/AnnouncementCard';

export default function AnnouncementList({ items }: { items: Announcement[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',   // 3 per row from md+
        },
        gap: 3,                    // ⬅️ increase spacing (3 = 24px). Use 4 for 32px.
        justifyItems: 'center',    // centers your fixed-width cards (250px) in each cell
        alignItems: 'start',
      }}
    >
      {items.map((a) => (
        <AnnouncementCard key={a.id} a={a} />
      ))}
    </Box>
  );
}
