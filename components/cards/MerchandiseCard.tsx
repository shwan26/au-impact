'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Merch } from '@/types/db';

export default function MerchandiseCard({ p }: { p: Merch }) {
  const img = p.images.poster;

  return (
    <Link
      href={`/public/merchandise/${p.slug}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        width: '220px',        // fixed width for uniform grid
      }}
    >
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Square image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
          {img?.url && (
            <Image
              src={img.url}
              alt={img.alt || p.title}
              fill
              sizes="220px"
              style={{ objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '10px' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={p.title}
          >
            {p.title}
          </h3>
          <p style={{ fontSize: '13px', color: '#555' }}>
            Price: {p.price} Baht
          </p>
        </div>
      </div>
    </Link>
  );
}
