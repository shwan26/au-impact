import Link from 'next/link';

export default function Landing() {
  return (
    <main className="container">
      <h1>AU Impact</h1>
      <p>Welcome! Explore public content or sign in to manage.</p>
      <ul>
        <li><Link href="/public">Go to Public area</Link></li>
        <li><Link href="/login">Login</Link></li>
      </ul>
    </main>
  );
}