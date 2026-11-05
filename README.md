# EFI Portal

Custom site and student portal for EFI Future Intelligence Institute, Lahore.

The approved EFI Harness storefront mirror is kept in `legacy/` and is not served. This Next.js app replaces it: Home, Courses, Timetable, Certificate, and Contact, using the institute copy, fees, and lab photos. Flyer posters are not rendered.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Branch map for quote Q-004:

| Branch | Feature |
|---|---|
| `feat/custom-site` | Custom website migration |
| `feat/portal-qr-onboarding` | Student portal, QR onboarding, admin, Google / passkey / email 2FA |
| `feat/certificate-generator` | Branded certificate PDFs and public roll-number verify |
| `feat/progress-syllabus-emails` | Syllabus, progress, timetable reminder emails |

Developed by [Cemzlah](https://cemzlah.com).
