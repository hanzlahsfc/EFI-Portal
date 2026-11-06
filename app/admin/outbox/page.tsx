import type { Metadata } from "next";
import { sendClassReminders } from "@/app/admin/actions";
import { readDb } from "@/lib/db";
import { batchMeets, classDays, karachiToday, reminderKey, reminderRecipients } from "@/lib/progress";

export const metadata: Metadata = { title: "Reminders" };

function when(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function plain(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, " · ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

const statusLabel = { demo: "Saved here", sent: "Emailed", failed: "Failed" };

export default async function OutboxPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const query = await searchParams;
  const today = karachiToday();
  const todayLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const view = await readDb((db) => {
    const meetings = db.batches.filter((batch) => batchMeets(batch, today)).map((batch) => ({
      batch,
      people: reminderRecipients(db, batch).map((user) => ({
        name: user.fullName,
        email: user.email,
        sent: db.outbox.some((message) => message.key === reminderKey(batch.id, today, user.email)),
      })),
    }));
    const unread = db.batches.filter((batch) => classDays(batch.days).length === 0);
    return { meetings, unread, messages: [...db.outbox].reverse().slice(0, 40) };
  });
  const waiting = view.meetings.reduce((sum, meeting) => sum + meeting.people.filter((person) => !person.sent).length, 0);

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <p className="kicker">timetable mail</p>
          <h1 style={{ fontSize: 48 }}>Reminders</h1>
        </div>
        <form action={sendClassReminders}>
          <button className="btn" type="submit" disabled={waiting === 0}>Send today's reminders</button>
        </form>
      </div>
      <p className="help">{todayLabel}. Students who are invited or active get one reminder when their batch meets. A second send the same day does not mail them again. Without a mail key, the note stays on this page.</p>
      {query.notice ? <p className="ok-note">{query.notice}</p> : null}

      <section className="panel stack">
        <h2>Classes today</h2>
        {view.meetings.length === 0 ? <p className="help">No batch meets today.</p> : null}
        {view.meetings.map(({ batch, people }) => (
          <div key={batch.id}>
            <strong>{batch.name}</strong>
            <p className="help">{batch.days} · {batch.time}</p>
            {people.length === 0 ? <p className="help">No invited or active students in this batch.</p> : null}
            <ul className="points">
              {people.map((person) => (
                <li key={person.email}>
                  <strong>{person.name}</strong>
                  <span>{person.email} · {person.sent ? "Already sent today" : "Not sent yet"}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {view.unread.length > 0 ? (
          <p className="help">These batches have no readable class days, so they never get a reminder: {view.unread.map((batch) => batch.name).join(", ")}. Use a label such as Mon–Thu or Fri, Sat.</p>
        ) : null}
      </section>

      <div className="table-wrap">
        <table>
          <thead><tr><th>When</th><th>To</th><th>Subject</th><th>Status</th></tr></thead>
          <tbody>
            {view.messages.length === 0 ? <tr><td colSpan={4}>No reminders yet.</td></tr> : null}
            {view.messages.map((message) => (
              <tr key={message.id}>
                <td className="mono">{when(message.createdAt)}</td>
                <td>{message.to}</td>
                <td>{message.subject}<br /><span className="help">{plain(message.html)}</span></td>
                <td><span className={message.status === "failed" ? "badge wait" : "badge"}>{statusLabel[message.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
