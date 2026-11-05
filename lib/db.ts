import fs from "fs";
import path from "path";
import { pullRemote, pushRemote } from "@/lib/remote";
import { createSeed, ensureCertificates, ensurePasswords } from "@/lib/seed";
import type { Database } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "db.json");

let state: Database | null = null;
let queue: Promise<void> = Promise.resolve();

function normalize(raw: Partial<Database>): Database {
  const seed = createSeed();
  return {
    users: raw.users ?? seed.users,
    batches: raw.batches?.length ? raw.batches : seed.batches,
    enrollments: raw.enrollments ?? [],
    passkeys: raw.passkeys ?? [],
    otps: raw.otps ?? [],
    challenges: raw.challenges ?? [],
    certificates: raw.certificates ?? [],
  };
}

function prune(db: Database) {
  const now = Date.now();
  db.otps = db.otps.filter((otp) => !otp.consumed && Date.parse(otp.expiresAt) > now).slice(-40);
  db.challenges = db.challenges.filter((challenge) => Date.parse(challenge.expiresAt) > now);
}

function readFile(): Database | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return normalize(JSON.parse(fs.readFileSync(filePath, "utf8")) as Partial<Database>);
  } catch (error) {
    console.error("Could not read data/db.json", error);
    return null;
  }
}

function writeFile(db: Database) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Could not write data/db.json", error);
  }
}

async function load() {
  if (state) return state;
  const remote = await pullRemote();
  const file = readFile();
  state = remote ?? file ?? createSeed();
  const changed = (await ensurePasswords(state)) || ensureCertificates(state);
  if (!file || changed || remote) {
    writeFile(state);
    if (changed || !remote) await pushRemote(state);
  }
  return state;
}

async function persist(db: Database) {
  state = db;
  writeFile(db);
  await pushRemote(db);
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

export function readDb<T>(fn: (db: Database) => T | Promise<T>) {
  return enqueue(async () => fn(await load()));
}

export function writeDb<T>(fn: (db: Database) => T | Promise<T>) {
  return enqueue(async () => {
    const db = await load();
    const result = await fn(db);
    prune(db);
    await persist(db);
    return result;
  });
}

export function nextRoll(db: Database) {
  let max = 1023;
  for (const user of db.users) {
    const match = user.rollNumber?.match(/^EFI-(\d+)$/i);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `EFI-${max + 1}`;
}

export function emailTaken(db: Database, email: string, exceptId?: string) {
  const needle = email.trim().toLowerCase();
  return db.users.some((user) => user.email.toLowerCase() === needle && user.id !== exceptId);
}
