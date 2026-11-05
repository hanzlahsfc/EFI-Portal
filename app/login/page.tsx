import type { Metadata } from "next";
import Link from "next/link";
import { demoMode } from "@/lib/session";
import { LoginClient } from "./login-client";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string; notice?: string; next?: string }>;
}) {
  const query = await searchParams;
  return (
    <main className="auth-shell">
      <section className="auth-copy">
        <Link href="/" className="logo-pad" style={{ alignSelf: "flex-start", marginBottom: 28 }}>
          <img src="/brand/efi-logo.png" alt="EFI Future Intelligence Institute" />
        </Link>
        <p className="kicker">Lahore lab · student desk</p>
        <h1>Your roll number, course, and class record.</h1>
        <p>Sign in with a password and email code, Google, or a passkey saved on this device.</p>
      </section>
      <section className="auth-panel">
        <LoginClient
          demo={demoMode()}
          initialStep={query.step === "2fa" ? "2fa" : "id"}
          initialError={query.error}
          notice={query.notice}
          nextPath={query.next}
        />
      </section>
    </main>
  );
}
