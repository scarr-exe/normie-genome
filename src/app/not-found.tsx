import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>Specimen Missing</h1>
      <p>This token is not present in the local genome index.</p>
      <Link href="/">Return to database</Link>
    </main>
  );
}
