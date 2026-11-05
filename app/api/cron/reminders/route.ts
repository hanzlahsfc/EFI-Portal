import { NextRequest, NextResponse } from "next/server";
import { writeDb } from "@/lib/db";
import { queueClassReminders } from "@/lib/progress";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }
  const result = await writeDb((db) => queueClassReminders(db));
  return NextResponse.json(result);
}
