// components/AUSOHeader.tsx
import Link from 'next/link'
import { usePendingCounts } from '@/hooks/usePendingCounts'

function Badge({ n }: { n: number }) {
  return (
    <span
      style={{
        marginLeft: 8,
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      ({n})
    </span>
  )
}

export default function AUSOHeader() {
  const { announcements, events, fundraising } = usePendingCounts('AUSO')

  const itemStyle: React.CSSProperties = {
    color: '#fff',
    fontWeight: 700,
    fontSize: 32,
    marginRight: 40,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  }

  return (
    <header
      style={{
        background: '#99271f',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Link href="/auso" style={{ ...itemStyle, marginRight: 48 }}>
        AUSO
      </Link>

      <Link href="/auso/events" style={itemStyle}>
        Events <Badge n={events} />
      </Link>

      <Link href="/auso/fundraising" style={itemStyle}>
        Fundraising <Badge n={fundraising} />
      </Link>

      <Link href="/auso/merch" style={itemStyle}>
        Merch
      </Link>

      <Link href="/auso/announcements" style={itemStyle}>
        Announcements <Badge n={announcements} />
      </Link>

      <div style={{ marginLeft: 'auto' }}>
        <Link href="/login" style={{ ...itemStyle, fontSize: 18, fontWeight: 600 }}>
          Login
        </Link>
      </div>
    </header>
  )
}
