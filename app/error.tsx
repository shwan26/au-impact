'use client';
export default function GlobalError({ error }: { error: Error }) {
  return (
    <div className="container">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
    </div>
  );
}