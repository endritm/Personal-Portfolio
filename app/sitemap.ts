import type { MetadataRoute } from "next";
import { getCaseStudySlugs, getExperimentSlugs } from "@/lib/content";
import { sections, siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [studies, experiments] = await Promise.all([getCaseStudySlugs(), getExperimentSlugs()]);
  return [
    { url: siteUrl, priority: 1 },
    ...Object.values(sections).map((s) => ({ url: `${siteUrl}${s.href}`, priority: s.href === "/work" ? 0.9 : 0.6 })),
    ...studies.map((slug) => ({ url: `${siteUrl}/work/${slug}`, priority: 0.8 })),
    ...experiments.map((slug) => ({ url: `${siteUrl}/experiments/${slug}`, priority: 0.5 })),
  ];
}
