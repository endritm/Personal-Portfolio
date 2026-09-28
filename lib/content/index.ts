/**
 * The only way pages read content. With Sanity configured it queries the Content Lake;
 * without it, it serves the seed content so the site always runs.
 */
import { cache } from "react";
import { sanityFetch } from "@/lib/sanity/client";
import { isSanityConfigured } from "@/lib/sanity/env";
import {
  aboutQuery,
  caseStudyQuery,
  caseStudySlugsQuery,
  experimentQuery,
  experimentSlugsQuery,
  experimentsQuery,
  funPageQuery,
  lightTableQuery,
  logosPageQuery,
  motionPageQuery,
  settingsQuery,
  workIndexQuery,
} from "@/lib/sanity/queries";
import { isSectionKey } from "@/lib/site";
import * as seed from "./seed";
import {
  tableObjectIds,
  type AboutPage,
  type CaseStudy,
  type CaseStudySummary,
  type Experiment,
  type ExperimentSummary,
  type FunPage,
  type LightTableContent,
  type LogosPage,
  type MotionPage,
  type Settings,
  type TableSlot,
  type WorkIndex,
} from "./types";

export * from "./types";

/** Drop null and undefined values so defaults can fill the gaps. */
function defined<T extends object>(value: T | null | undefined): Partial<T> {
  if (!value) return {};
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>;
}

function summarize(study: CaseStudy): CaseStudySummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { blocks, role, deliverables, credits, seo, ...summary } = study;
  return summary;
}

/** Featured in the chosen order, then everything else, newest first. */
export function splitWorkIndex(featured: CaseStudySummary[], all: CaseStudySummary[]): WorkIndex {
  const featuredIds = new Set(featured.map((s) => s._id));
  return { featured, archive: all.filter((s) => !featuredIds.has(s._id)) };
}

export const getSettings = cache(async (): Promise<Settings> => {
  if (!isSanityConfigured) return seed.settings;
  const remote = await sanityFetch<Partial<Settings> | null>(settingsQuery);
  const merged = { ...seed.settings, ...defined(remote) };
  return { ...merged, availability: { ...seed.settings.availability, ...defined(remote?.availability) } };
});

export const getLightTable = cache(async (): Promise<LightTableContent> => {
  if (!isSanityConfigured) return seed.lightTable;
  const remote = await sanityFetch<{ slots?: Partial<Record<string, Partial<TableSlot>>>; tracks: string[] } | null>(
    lightTableQuery,
  );
  const slots = Object.fromEntries(
    tableObjectIds.map((id) => {
      const fallback = seed.lightTable.slots[id];
      const slot = remote?.slots?.[id];
      return [
        id,
        {
          section: isSectionKey(slot?.section) ? slot.section : fallback.section,
          label: slot?.label || fallback.label,
          note: slot?.note ?? fallback.note,
        },
      ];
    }),
  ) as LightTableContent["slots"];
  return { slots, tracks: remote?.tracks ?? [] };
});

export const getWorkIndex = cache(async (): Promise<WorkIndex> => {
  if (!isSanityConfigured) {
    const all = seed.caseStudies.map(summarize);
    const featured = seed.featuredSlugs.map((slug) => all.find((s) => s.slug === slug)!).filter(Boolean);
    return splitWorkIndex(featured, all);
  }
  const { featured, all } = await sanityFetch<{ featured: (CaseStudySummary | null)[]; all: CaseStudySummary[] }>(
    workIndexQuery,
  );
  return splitWorkIndex(featured.filter((s): s is CaseStudySummary => Boolean(s?.slug)), all);
});

export const getCaseStudy = cache(async (slug: string): Promise<CaseStudy | null> => {
  if (!isSanityConfigured) return seed.caseStudies.find((s) => s.slug === slug) ?? null;
  return sanityFetch<CaseStudy | null>(caseStudyQuery, { slug });
});

export async function getCaseStudySlugs(): Promise<string[]> {
  if (!isSanityConfigured) return seed.caseStudies.map((s) => s.slug);
  return sanityFetch<string[]>(caseStudySlugsQuery);
}

/** The next case study in reading order: featured first, then the archive. Wraps around. */
export async function getNextCaseStudy(slug: string): Promise<CaseStudySummary | null> {
  const { featured, archive } = await getWorkIndex();
  const order = [...featured, ...archive];
  const index = order.findIndex((s) => s.slug === slug);
  if (index === -1 || order.length < 2) return null;
  return order[(index + 1) % order.length];
}

export const getExperiments = cache(async (): Promise<ExperimentSummary[]> => {
  if (!isSanityConfigured) return seed.experiments;
  return sanityFetch<ExperimentSummary[]>(experimentsQuery);
});

export const getExperiment = cache(async (slug: string): Promise<Experiment | null> => {
  if (!isSanityConfigured) return seed.experiments.find((e) => e.slug === slug) ?? null;
  return sanityFetch<Experiment | null>(experimentQuery, { slug });
});

export async function getExperimentSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return seed.experiments.map((e) => e.slug);
  return sanityFetch<string[]>(experimentSlugsQuery);
}

export const getAbout = cache(async (): Promise<AboutPage> => {
  if (!isSanityConfigured) return seed.about;
  return { ...seed.about, ...defined(await sanityFetch<AboutPage | null>(aboutQuery)) };
});

export const getMotionPage = cache(async (): Promise<MotionPage> => {
  if (!isSanityConfigured) return seed.motionPage;
  return { ...seed.motionPage, pieces: [], ...defined(await sanityFetch<MotionPage | null>(motionPageQuery)) };
});

export const getLogosPage = cache(async (): Promise<LogosPage> => {
  if (!isSanityConfigured) return seed.logosPage;
  return { ...seed.logosPage, logos: [], ...defined(await sanityFetch<LogosPage | null>(logosPageQuery)) };
});

export const getFunPage = cache(async (): Promise<FunPage> => {
  if (!isSanityConfigured) return seed.funPage;
  return { ...seed.funPage, items: [], ...defined(await sanityFetch<FunPage | null>(funPageQuery)) };
});
