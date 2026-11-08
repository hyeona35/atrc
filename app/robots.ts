import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/x-feed"],
      },
    ],
    sitemap: "https://atrc.hyeona3.com/sitemap.xml",
    host: "https://atrc.hyeona3.com",
  };
}
