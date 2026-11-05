import type { Metadata } from "next";
import { changeStaffPassword } from "@/app/admin/actions";
import { PasskeyPanel } from "@/app/portal/account/passkey-panel";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Staff account" };

export default async function StaffAccountPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const user = await requireUser("staff");
  const query = await searchParams;
  const devices = await readDb((db) => db.passkeys.filter((item) => item.userId === user.id).map((item) => item.deviceName));
  return (
    <div className="stack">
      <div>
        <p className="kicker">EFI&gt; staff</p>
        <h1 style={{ fontSize: 48 }}>Account</h1>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.notice ? <p className="ok-note">{query.notice}</p> : null}
      <form className="panel form-grid" action={changeStaffPassword}>
        <label className="field"><span>Current password</span><input name="current" type="password" required /></label>
        <label className="field"><span>New password</span><input name="next" type="password" minLength={8} required /></label>
        <div className="span-2"><button className="btn" type="submit">Update password</button></div>
      </form>
      <PasskeyPanel devices={devices} />
    </div>
  );
}
