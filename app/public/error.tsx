'use client';
export default function ErrorBoundary({ error }: { error: Error }) {
  return <div className="card">{error.message}</div>;
}
