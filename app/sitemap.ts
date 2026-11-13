import type { MetadataRoute } from "next";
import { courses } from "@/lib/catalog";

const base = "https://efifutureintelligence.institute";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/courses", "/timetable", "/certificate", "/contact", "/login"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const coursePages = courses.map((course) => ({
    url: `${base}/courses/${course.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
  return [...staticPages, ...coursePages];
}
