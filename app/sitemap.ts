import type { MetadataRoute } from "next";

const BASE = "https://courtsidecentral.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/home`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/franchise`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/higher-lower`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/connections`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/my-team`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/badge-court`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/lineup-thief`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/simulations`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/challenges`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  ];
}
