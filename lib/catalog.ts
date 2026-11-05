export type Module = {
  id: string;
  code: string;
  title: string;
  summary: string;
  hours: number;
};

export type Course = {
  slug: string;
  name: string;
  duration: string;
  feePkr: number;
  days: string;
  time: string;
  summary: string;
  photo: string;
  points: string[];
  moduleIds: string[];
};

export const institute = {
  name: "EFI Future Intelligence Institute",
  short: "EFI",
  phoneDisplay: "+92 370 438 1083",
  phoneTel: "+923704381083",
  whatsapp: "923704381083",
  address: "53B, Aitchison Society, Lahore",
  website: "https://www.efiinstitute.com",
  hours: "Mon–Thu 2–6 PM · Fri–Sun 3–9 PM",
  weekdayHours: "Mon–Thu 2:00–6:00 PM",
  weekendHours: "Fri–Sun 3:00–9:00 PM",
};

export const modules: Module[] = [
  {
    id: "m1",
    code: "M1",
    title: "Electrical fundamentals and safety",
    summary: "Meters, basic circuits, and workshop safety.",
    hours: 24,
  },
  {
    id: "m2",
    code: "M2",
    title: "Battery, starting, and charging",
    summary: "Batteries, alternators, and starter circuits.",
    hours: 24,
  },
  {
    id: "m3",
    code: "M3",
    title: "Wiring and relay systems",
    summary: "Harness layout, central wiring, and relays.",
    hours: 28,
  },
  {
    id: "m4",
    code: "M4",
    title: "Sensors, actuators, and EFI",
    summary: "Engine sensors, injectors, and the EFI system.",
    hours: 36,
  },
  {
    id: "m5",
    code: "M5",
    title: "Diagnostics and scanners",
    summary: "OBD-II connection and computerized diagnostics.",
    hours: 36,
  },
  {
    id: "m6",
    code: "M6",
    title: "CAN bus and module programming",
    summary: "ECU, body modules, and key-fob programming.",
    hours: 40,
  },
];

export const courses: Course[] = [
  {
    slug: "3-month-certification",
    name: "3-month certification",
    duration: "3 months",
    feePkr: 25000,
    days: "Mon–Thu",
    time: "2:00–4:00 PM or 4:00–6:00 PM",
    summary: "Foundation auto-electrical course for a first certification. Lab sessions on meters, charging systems, and wiring.",
    photo: "/photos/thumb-1.jpg",
    points: ["Electrical fundamentals and safety", "Battery, starting, and charging", "Wiring and relays"],
    moduleIds: ["m1", "m2", "m3"],
  },
  {
    slug: "6-month-certification",
    name: "6-month certification",
    duration: "6 months",
    feePkr: 50000,
    days: "Mon–Thu",
    time: "Weekday track",
    summary: "The full weekday syllabus through sensors, EFI, and OBD-II scanner work.",
    photo: "/photos/thumb-3.jpg",
    points: ["Sensors, actuators, and EFI systems", "Computerized diagnostics", "OBD-II scanners"],
    moduleIds: ["m1", "m2", "m3", "m4", "m5"],
  },
  {
    slug: "pro-technical",
    name: "Pro and technical",
    duration: "6 months",
    feePkr: 50000,
    days: "Fri–Sun",
    time: "6:00–9:00 PM",
    summary: "Weekend evening batch for CAN bus, module programming, and key-fob work.",
    photo: "/photos/thumb-4.jpg",
    points: ["CAN bus and module programming", "ECU and body control work", "Key-fob programming"],
    moduleIds: ["m1", "m2", "m3", "m4", "m5", "m6"],
  },
  {
    slug: "3-month-weekend",
    name: "3-month weekend",
    duration: "3 months",
    feePkr: 25000,
    days: "Fri–Sun",
    time: "3:00–6:00 PM",
    summary: "The same foundation lab, scheduled for students who work on weekdays.",
    photo: "/photos/thumb-2.jpg",
    points: ["Core auto electrical", "For students who work on weekdays", "Same lab, shorter week"],
    moduleIds: ["m1", "m2", "m3"],
  },
];

export function courseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug) ?? null;
}

export function modulesFor(course: Course) {
  return course.moduleIds
    .map((id) => modules.find((mod) => mod.id === id))
    .filter((mod): mod is Module => Boolean(mod));
}

export function pkr(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export function whatsappLink(message: string) {
  return `https://wa.me/${institute.whatsapp}?text=${encodeURIComponent(message)}`;
}
