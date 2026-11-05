export type Role = "student" | "staff";
export type EnrollmentStatus = "invited" | "active" | "completed" | "withdrawn";

export interface User {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
  rollNumber: string | null;
  batchId: string | null;
  qrToken: string | null;
  onboarded: boolean;
  passwordHash: string | null;
  shopifyCustomerId: string | null;
  createdAt: string;
}

export interface Batch {
  id: string;
  courseSlug: string;
  name: string;
  days: string;
  time: string;
  startDate: string;
  endDate: string;
  seats: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseSlug: string;
  batchId: string;
  status: EnrollmentStatus;
  shopifyOrderId: string | null;
  enrolledAt: string;
}

export interface Passkey {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[];
  deviceName: string;
  createdAt: string;
}

export interface Otp {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
  consumed: boolean;
}

export interface Challenge {
  id: string;
  kind: "register" | "login";
  userId: string | null;
  challenge: string;
  expiresAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  enrollmentId: string;
  rollNumber: string;
  studentName: string;
  courseName: string;
  issuedAt: string;
  serial: string;
}

export interface ProgressRow {
  id: string;
  enrollmentId: string;
  moduleId: string;
  completed: boolean;
  testScore: number | null;
  completedAt: string | null;
}

export interface OutboxMessage {
  id: string;
  to: string;
  subject: string;
  html: string;
  createdAt: string;
  status: "demo" | "sent" | "failed";
  key: string;
}

export interface Database {
  users: User[];
  batches: Batch[];
  enrollments: Enrollment[];
  passkeys: Passkey[];
  otps: Otp[];
  challenges: Challenge[];
  certificates: Certificate[];
  progress: ProgressRow[];
  outbox: OutboxMessage[];
}
