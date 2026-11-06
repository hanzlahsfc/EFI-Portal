import type { Metadata } from "next";
import Link from "next/link";
import { activateFromQr } from "@/app/portal/actions";
import { SiteFooter } from "@/components/site-footer";
import { SignedHeader } from "@/components/signed-header";
import { courseBySlug } from "@/lib/catalog";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Onboarding" };

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `···· ${digits.slice(-4)}` : "on file";
}

export default async function OnboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const data = await readDb((db) => {
    const user = db.users.find((item) => item.qrToken === token && item.role === "student");
    if (!user) return null;
    const enrollment = db.enrollments.find((item) => item.userId === user.id);
    const batch = db.batches.find((item) => item.id === user.batchId);
    return { user, enrollment, batch };
  });

  return (
    <>
      <SignedHeader />
      <main className="ed">
        <section className="ed-learn">
          <div className="ed-wrap" style={{ maxWidth: 560 }}>
            <header className="ed-head">
              <h2>Confirm this is your seat</h2>
              <p>The institute printed this code for one student. Set a password to open the desk.</p>
            </header>
            <div className="auth-card stack">
          {!data ? <p className="error">This QR is not on the EFI roll. Ask the desk to print a new one.</p> : null}
          {data?.user.onboarded ? (
            <>
              <h1 style={{ fontSize: 42 }}>{data.user.fullName}</h1>
              <p className="help">This account is already set up. Sign in with the password, Google, or a passkey.</p>
              <Link className="btn" href="/login">Sign in</Link>
            </>
          ) : null}
          {data && !data.user.onboarded ? (
            <>
              {query.error ? <p className="error">{query.error}</p> : null}
              <h1 style={{ fontSize: 42 }}>{data.user.fullName}</h1>
              <p className="mono">{data.user.rollNumber}</p>
              <p className="help">{courseBySlug(data.enrollment?.courseSlug ?? "")?.name}</p>
              <p className="help">{data.batch ? `${data.batch.name} · ${data.batch.days} ${data.batch.time}` : "Batch assigned at the desk"}</p>
              <p className="help">Phone {maskPhone(data.user.phone)}</p>
              <form className="stack" action={activateFromQr}>
                <input type="hidden" name="token" value={token} />
                <label className="field"><span>Password</span><input name="password" type="password" minLength={8} required /></label>
                <label className="field"><span>Confirm password</span><input name="confirm" type="password" minLength={8} required /></label>
                <button className="btn" type="submit">Open my account</button>
              </form>
            </>
          ) : null}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
