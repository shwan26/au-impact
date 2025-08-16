'use client';

import * as React from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import type { Announcement } from '@/types/db';
import { formatDate } from '@/lib/format';

const CARD_WIDTH = 250; // fixed card width in px


export default function AnnouncementCard({ a }: { a: Announcement }) {
  return (
    <Card elevation={1} sx={{ width: CARD_WIDTH, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Link href={`/public/announcements/${a.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flex: 1, flexDirection: 'column' }}>
        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {a.photoUrl ? (
            <CardMedia
              component="img"
              image={a.photoUrl}
              alt={a.topic}
              sx={{ aspectRatio: '4 / 5', width: '100%', objectFit: 'cover', flexShrink: 0 }}
              loading="lazy"
            />
          ) : (
            <CardMedia component="div" sx={{ aspectRatio: '4 / 5', bgcolor: 'grey.200', flexShrink: 0 }} />
          )}

          {/* Title moved higher: no `mt: 'auto'` */}
          <CardContent sx={{ pt: 1.25, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {a.topic}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(a.datePosted)}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
