import type { Metadata } from "next";
import { changeStudentPassword } from "@/app/portal/actions";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { PasskeyPanel } from "./passkey-panel";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const user = await requireUser("student");
  const query = await searchParams;
  const devices = await readDb((db) => db.passkeys.filter((item) => item.userId === user.id).map((item) => item.deviceName));

  return (
    <div className="stack">
      <div>
        <p className="kicker">EFI&gt; {user.rollNumber}</p>
        <h1 style={{ fontSize: 48 }}>Account</h1>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.notice ? <p className="ok-note">{query.notice}</p> : null}
      <div className="panel">
        <h2>Record</h2>
        <p className="contact-line">{user.fullName}</p>
        <p className="contact-line">{user.email}</p>
        <p className="contact-line">{user.phone}</p>
        <p className="contact-line">{user.cnic || "CNIC not on file"}</p>
      </div>
      <form className="panel form-grid" action={changeStudentPassword}>
        <h2 className="span-2">Password</h2>
        <label className="field"><span>Current password</span><input name="current" type="password" required /></label>
        <label className="field"><span>New password</span><input name="next" type="password" minLength={8} required /></label>
        <div className="span-2"><button className="btn" type="submit">Update password</button></div>
      </form>
      <PasskeyPanel devices={devices} />
    </div>
  );
}
