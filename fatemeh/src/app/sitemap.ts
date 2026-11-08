import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { TREATMENTS } from "@/content/treatments";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("", 1, "weekly"),
    page("/assessment", 0.9),
    page("/results", 0.9, "weekly"),
    page("/treatments", 0.8),
    ...TREATMENTS.map((t) => page(`/treatments/${t.slug}`, 0.8)),
    page("/about", 0.7),
    page("/faq", 0.6),
    page("/contact", 0.6),
    page("/privacy", 0.3, "yearly"),
  ];
}
