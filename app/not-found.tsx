import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section">
      <div className="wrap">
        <p className="kicker">EFI&gt; 404</p>
        <h1>That page is not on the board.</h1>
        <p className="lede">The address does not match a course, a certificate, or a portal screen.</p>
        <Link className="btn dark" href="/">Back to home</Link>
      </div>
    </main>
  );
}
