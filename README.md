# EFI Portal

Custom site and student portal for EFI Future Intelligence Institute, Lahore.

The approved EFI Harness storefront mirror is kept in `legacy/` and is not served. This Next.js app replaces it: Home, Courses, Timetable, Certificate, and Contact, using the institute copy, fees, and lab photos. Flyer posters are not rendered.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Copy `.env.example` to `.env.local` before a public deploy. Until `DEMO_MODE=0`, the sign-in screen shows demo accounts:

- Staff: `staff@efiinstitute.com` / `efi-staff-demo`
- Student: `ali.raza@example.com` / `efi-student-demo`
- QR onboard: `/onboard/onboard-hassan-efi1025`

Password and Google sign-in then ask for an email code. Without `RESEND_API_KEY`, demo mode shows that code on the sign-in screen. Passkeys sign in directly after a student or staff member adds one from Account.

Shopify can open a student record with `POST /api/shopify/enroll` and header `x-efi-secret: $EFI_SHOPIFY_SECRET`. Body: `email`, `fullName`, `phone`, `courseSlug`, `orderId`.

Apply `supabase/migrations/001_portal.sql` and set `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` to store the roll in Supabase. With those unset, the desk uses `data/db.json`.

Branch map for quote Q-004:

| Branch | Feature |
|---|---|
| `feat/custom-site` | Custom website migration |
| `feat/portal-qr-onboarding` | Student portal, QR onboarding, admin, Google / passkey / email 2FA |
| `feat/certificate-generator` | Branded certificate PDFs and public roll-number verify |
| `feat/progress-syllabus-emails` | Syllabus, progress, timetable reminder emails |

Developed by [Cemzlah](https://cemzlah.com).
