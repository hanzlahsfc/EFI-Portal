import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Batch, Challenge, Database, Enrollment, Otp, Passkey, User } from "@/lib/types";

function client(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function userFromRow(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    role: row.role === "staff" ? "staff" : "student",
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    cnic: String(row.cnic ?? ""),
    rollNumber: row.roll_number ? String(row.roll_number) : null,
    batchId: row.batch_id ? String(row.batch_id) : null,
    qrToken: row.qr_token ? String(row.qr_token) : null,
    onboarded: Boolean(row.onboarded),
    passwordHash: row.password_hash ? String(row.password_hash) : null,
    shopifyCustomerId: row.shopify_customer_id ? String(row.shopify_customer_id) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function userToRow(user: User) {
  return {
    id: user.id,
    role: user.role,
    full_name: user.fullName,
    email: user.email,
    phone: user.phone,
    cnic: user.cnic,
    roll_number: user.rollNumber,
    batch_id: user.batchId,
    qr_token: user.qrToken,
    onboarded: user.onboarded,
    password_hash: user.passwordHash,
    shopify_customer_id: user.shopifyCustomerId,
    created_at: user.createdAt,
  };
}

export async function pullRemote(): Promise<Database | null> {
  const db = client();
  if (!db) return null;
  const [users, batches, enrollments, passkeys, otps, challenges] = await Promise.all([
    db.from("users").select("*"),
    db.from("batches").select("*"),
    db.from("enrollments").select("*"),
    db.from("passkeys").select("*"),
    db.from("otps").select("*"),
    db.from("challenges").select("*"),
  ]);
  if (users.error || batches.error || enrollments.error || passkeys.error || otps.error || challenges.error) {
    console.error("Supabase read failed", users.error ?? batches.error ?? enrollments.error);
    return null;
  }
  if (!users.data?.length) return null;
  return {
    users: (users.data as Record<string, unknown>[]).map(userFromRow),
    batches: (batches.data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      courseSlug: String(row.course_slug),
      name: String(row.name),
      days: String(row.days),
      time: String(row.time),
      startDate: String(row.start_date).slice(0, 10),
      endDate: String(row.end_date).slice(0, 10),
      seats: Number(row.seats),
    })),
    enrollments: (enrollments.data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      courseSlug: String(row.course_slug),
      batchId: String(row.batch_id),
      status: row.status as Enrollment["status"],
      shopifyOrderId: row.shopify_order_id ? String(row.shopify_order_id) : null,
      enrolledAt: String(row.enrolled_at),
    })),
    passkeys: (passkeys.data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      credentialId: String(row.credential_id),
      publicKey: String(row.public_key),
      counter: Number(row.counter),
      transports: Array.isArray(row.transports) ? row.transports.map(String) : [],
      deviceName: String(row.device_name ?? "Passkey"),
      createdAt: String(row.created_at),
    })),
    otps: (otps.data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      codeHash: String(row.code_hash),
      expiresAt: String(row.expires_at),
      attempts: Number(row.attempts ?? 0),
      consumed: Boolean(row.consumed),
    })),
    challenges: (challenges.data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      kind: row.kind === "register" ? "register" : "login",
      userId: row.user_id ? String(row.user_id) : null,
      challenge: String(row.challenge),
      expiresAt: String(row.expires_at),
    })),
  };
}

async function upsert(db: SupabaseClient, table: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const { error } = await db.from(table).upsert(rows);
  if (error) throw error;
}

export async function pushRemote(state: Database) {
  const db = client();
  if (!db) return;
  try {
    await upsert(db, "batches", state.batches.map((batch: Batch) => ({
      id: batch.id,
      course_slug: batch.courseSlug,
      name: batch.name,
      days: batch.days,
      time: batch.time,
      start_date: batch.startDate,
      end_date: batch.endDate,
      seats: batch.seats,
    })));
    await upsert(db, "users", state.users.map(userToRow));
    await upsert(db, "enrollments", state.enrollments.map((row: Enrollment) => ({
      id: row.id,
      user_id: row.userId,
      course_slug: row.courseSlug,
      batch_id: row.batchId,
      status: row.status,
      shopify_order_id: row.shopifyOrderId,
      enrolled_at: row.enrolledAt,
    })));
    await upsert(db, "passkeys", state.passkeys.map((row: Passkey) => ({
      id: row.id,
      user_id: row.userId,
      credential_id: row.credentialId,
      public_key: row.publicKey,
      counter: row.counter,
      transports: row.transports,
      device_name: row.deviceName,
      created_at: row.createdAt,
    })));
    await upsert(db, "otps", state.otps.map((row: Otp) => ({
      id: row.id,
      user_id: row.userId,
      code_hash: row.codeHash,
      expires_at: row.expiresAt,
      attempts: row.attempts,
      consumed: row.consumed,
    })));
    await upsert(db, "challenges", state.challenges.map((row: Challenge) => ({
      id: row.id,
      kind: row.kind,
      user_id: row.userId,
      challenge: row.challenge,
      expires_at: row.expiresAt,
    })));
  } catch (error) {
    console.error("Supabase write failed", error);
  }
}
