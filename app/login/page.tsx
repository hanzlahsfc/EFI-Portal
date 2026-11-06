import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SignedHeader } from "@/components/signed-header";
import { currentUser } from "@/lib/auth";
import { demoMode } from "@/lib/session";
import { LoginClient } from "./login-client";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string; notice?: string; next?: string }>;
}) {
  const query = await searchParams;
  const user = await currentUser();
  if (user && query.step !== "2fa") redirect(user.role === "staff" ? "/admin" : "/portal");
  return (
    <>
      <SignedHeader />
      <main className="ed">
        <section className="ed-learn">
          <div className="ed-wrap" style={{ maxWidth: 520 }}>
            <LoginClient
              demo={demoMode()}
              initialStep={query.step === "2fa" ? "2fa" : "id"}
              initialError={query.error}
              notice={query.notice}
              nextPath={query.next}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
