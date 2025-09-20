// app/login/page.tsx
import { redirect } from 'next/navigation';

export default function LoginRedirect() {
  // Redirect /login -> /public/login
  redirect('/public/login');
}
