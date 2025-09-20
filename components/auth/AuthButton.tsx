'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function AuthButton(){
  const { user, logout } = useAuth();
  if (!user) return <Link href="/login">Login</Link>;
  return (
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <span style={{color:'var(--text-muted)'}}>{user.email} • {user.role}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}