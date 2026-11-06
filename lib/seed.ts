import { hashPassword } from "@/lib/codec";
import type { Batch, Certificate, Database, User } from "@/lib/types";

export const seedBatches: Batch[] = [
  {
    id: "b-3m-afternoon",
    courseSlug: "3-month-certification",
    name: "Weekday afternoon · Nov 2026",
    days: "Mon–Thu",
    time: "2:00–4:00 PM",
    startDate: "2026-11-02",
    endDate: "2027-01-28",
    seats: 16,
  },
  {
    id: "b-3m-evening",
    courseSlug: "3-month-certification",
    name: "Weekday evening · Nov 2026",
    days: "Mon–Thu",
    time: "4:00–6:00 PM",
    startDate: "2026-11-02",
    endDate: "2027-01-28",
    seats: 16,
  },
  {
    id: "b-6m",
    courseSlug: "6-month-certification",
    name: "Weekday · Nov 2026",
    days: "Mon–Thu",
    time: "2:00–6:00 PM",
    startDate: "2026-11-02",
    endDate: "2027-04-29",
    seats: 16,
  },
  {
    id: "b-pro",
    courseSlug: "pro-technical",
    name: "Weekend evening · Nov 2026",
    days: "Fri–Sun",
    time: "6:00–9:00 PM",
    startDate: "2026-11-06",
    endDate: "2027-05-02",
    seats: 12,
  },
  {
    id: "b-weekend",
    courseSlug: "3-month-weekend",
    name: "Weekend · Nov 2026",
    days: "Fri–Sun",
    time: "3:00–6:00 PM",
    startDate: "2026-11-06",
    endDate: "2027-01-31",
    seats: 12,
  },
];

const people: User[] = [
  {
    id: "staff-1",
    role: "staff",
    fullName: "EFI Staff",
    email: "staff@efiinstitute.com",
    phone: "+923704381083",
    cnic: "",
    rollNumber: null,
    batchId: null,
    qrToken: null,
    onboarded: true,
    passwordHash: null,
    shopifyCustomerId: null,
    createdAt: "2026-11-01T08:00:00.000Z",
  },
  {
    id: "stu-ali",
    role: "student",
    fullName: "Ali Raza",
    email: "ali.raza@example.com",
    phone: "+923001112233",
    cnic: "35202-1234567-1",
    rollNumber: "EFI-1024",
    batchId: "b-3m-afternoon",
    qrToken: "onboard-ali-efi1024",
    onboarded: true,
    passwordHash: null,
    shopifyCustomerId: null,
    createdAt: "2026-11-02T09:00:00.000Z",
  },
  {
    id: "stu-hassan",
    role: "student",
    fullName: "Hassan Iqbal",
    email: "hassan.iqbal@example.com",
    phone: "+923004445566",
    cnic: "35202-7654321-9",
    rollNumber: "EFI-1025",
    batchId: "b-6m",
    qrToken: "onboard-hassan-efi1025",
    onboarded: false,
    passwordHash: null,
    shopifyCustomerId: null,
    createdAt: "2026-11-04T09:00:00.000Z",
  },
];

export function createSeed(): Database {
  return {
    users: people.map((user) => ({ ...user })),
    batches: seedBatches.map((batch) => ({ ...batch })),
    enrollments: [
      {
        id: "enr-ali",
        userId: "stu-ali",
        courseSlug: "3-month-certification",
        batchId: "b-3m-afternoon",
        status: "completed",
        shopifyOrderId: null,
        enrolledAt: "2026-11-02T09:00:00.000Z",
      },
      {
        id: "enr-hassan",
        userId: "stu-hassan",
        courseSlug: "6-month-certification",
        batchId: "b-6m",
        status: "invited",
        shopifyOrderId: null,
        enrolledAt: "2026-11-04T09:00:00.000Z",
      },
    ],
    passkeys: [],
    otps: [],
    challenges: [],
    certificates: [aliCertificate()],
    progress: [],
    outbox: [],
  };
}

function aliCertificate(): Certificate {
  return {
    id: "cert-ali",
    userId: "stu-ali",
    enrollmentId: "enr-ali",
    rollNumber: "EFI-1024",
    studentName: "Ali Raza",
    courseName: "3-month certification",
    issuedAt: "2026-11-05T08:00:00.000Z",
    serial: "EFI-C-1024",
  };
}

export function ensureCertificates(db: Database) {
  if (!db.certificates) db.certificates = [];
  if (db.certificates.some((item) => item.rollNumber === "EFI-1024")) return false;
  if (!db.users.some((user) => user.id === "stu-ali")) return false;
  db.certificates.push(aliCertificate());
  const enrollment = db.enrollments.find((item) => item.id === "enr-ali");
  if (enrollment && enrollment.status === "active") enrollment.status = "completed";
  return true;
}

export async function ensurePasswords(db: Database) {
  if (process.env.DEMO_MODE === "0") return false;
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || "efi-staff-demo";
  const studentPassword = process.env.DEMO_STUDENT_PASSWORD || "efi-student-demo";
  let changed = false;
  for (const user of db.users) {
    if (user.passwordHash) continue;
    if (user.id === "staff-1") {
      user.passwordHash = await hashPassword(adminPassword);
      changed = true;
    } else if (user.id === "stu-ali") {
      user.passwordHash = await hashPassword(studentPassword);
      changed = true;
    }
  }
  return changed;
}
