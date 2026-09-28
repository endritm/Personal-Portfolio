export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Every section of the site. Each is a real, shareable route. */
export const sections = {
  work: { href: "/work", title: "Work" },
  experiments: { href: "/experiments", title: "Experiments" },
  motion: { href: "/motion", title: "Motion" },
  logos: { href: "/logos", title: "Logos" },
  fun: { href: "/fun", title: "Fun" },
  about: { href: "/about", title: "About" },
  contact: { href: "/contact", title: "Contact" },
} as const;

export type SectionKey = keyof typeof sections;

export const sectionKeys = Object.keys(sections) as SectionKey[];

export function isSectionKey(value: unknown): value is SectionKey {
  return typeof value === "string" && value in sections;
}
