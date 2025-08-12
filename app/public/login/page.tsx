'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Role } from '@/types/db';

const ROLE_COOKIE = 'au_role';

export default function LoginPage(){
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');

  function handleLogin(){
    document.cookie = `${ROLE_COOKIE}=${role}; path=/`;
    localStorage.setItem('au_user', JSON.stringify({ email, role }));
    router.replace(sp.get('next') || '/public');
  }

  return (
    <main className="container">
      <h1>Login (Demo)</h1>
      <div className="card" style={{maxWidth:480}}>
        <label>Email<br/>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@au.edu" />
        </label>
        <div style={{height:8}}/>
        <label>Role<br/>
          <select value={role} onChange={(e)=>setRole(e.target.value as Role)}>
            <option value="STUDENT">Student (public)</option>
            <option value="SAU">SAU</option>
            <option value="AUSO">AUSO</option>
          </select>
        </label>
        <div style={{height:16}}/>
        <button onClick={handleLogin}>Continue</button>
      </div>
    </main>
  );
}
