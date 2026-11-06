import Link from "next/link";

export default function NotFound() {
  return (
    <main className="ed">
      <section className="ed-learn">
        <div className="ed-wrap">
          <header className="ed-head">
            <h2>Page not found</h2>
            <p>The address does not match a course, a certificate, or a portal screen.</p>
          </header>
          <Link className="ed-btn" href="/">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
