import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://atrc.hyeona3.com";
  const lastModified = new Date("2026-11-08T00:00:00+09:00");

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/x-feed`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/feed.xml`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.7,
    },
  ];
}
