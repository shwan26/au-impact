'use client';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

export default function Nav(){
  return (
    <nav className="container" style={{display:'flex',gap:16,alignItems:'center',padding:'16px 0'}}>
      <Link href="/public"><strong>AU Impact</strong></Link>
      <span style={{flex:1}}/>
      <Link href="/public/event">Events</Link>
      <Link href="/public/fundraising">Fundraising</Link>
      <Link href="/public/merchandise">Merchandise</Link>
      <Link href="/public/announcements">Announcements</Link>
      <AuthButton />
    </nav>
  );
}