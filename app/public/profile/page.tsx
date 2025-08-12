'use client';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage(){
  const { user } = useAuth();
  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}