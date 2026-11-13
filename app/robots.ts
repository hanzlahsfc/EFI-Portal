import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal", "/admin", "/api", "/onboard", "/login"],
    },
    sitemap: "https://efifutureintelligence.institute/sitemap.xml",
  };
}
