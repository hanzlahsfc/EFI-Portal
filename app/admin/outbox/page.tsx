import type { Metadata } from "next";
import { sendClassReminders } from "@/app/admin/actions";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Reminders" };

export default async function OutboxPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const query = await searchParams;
  const messages = await readDb((db) => [...db.outbox].reverse().slice(0, 40));

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <p className="kicker">EFI&gt; timetable mail</p>
          <h1 style={{ fontSize: 48 }}>Reminders</h1>
        </div>
        <form action={sendClassReminders}>
          <button className="btn" type="submit">Queue today's classes</button>
        </form>
      </div>
      <p className="help">The daily job runs at 08:00 Pakistan time and mails students whose batch meets that day. Without a mail key, the message stays in this outbox.</p>
      {query.notice ? <p className="ok-note">{query.notice}</p> : null}
      <div className="table-wrap">
        <table>
          <thead><tr><th>When</th><th>To</th><th>Subject</th><th>Status</th></tr></thead>
          <tbody>
            {messages.length === 0 ? <tr><td colSpan={4}>No reminders yet.</td></tr> : null}
            {messages.map((message) => (
              <tr key={message.id}>
                <td className="mono">{message.createdAt.slice(0, 16).replace("T", " ")}</td>
                <td>{message.to}</td>
                <td>{message.subject}</td>
                <td><span className="badge">{message.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
