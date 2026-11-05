import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import { readSession } from "@/lib/session";
import type { Role, User } from "@/lib/types";

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const session = await readSession(jar.get("efi_session")?.value);
  if (!session) return null;
  return readDb((db) => db.users.find((user) => user.id === session.uid) ?? null);
}

export async function requireUser(role?: Role) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(user.role === "staff" ? "/admin" : "/portal");
  return user;
}
