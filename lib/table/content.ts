import { getExperiments, getLightTable, getLogosPage, getMotionPage, getSettings, getWorkIndex } from "@/lib/content";
import type { TableContent } from "./faces";
import { SLIDE_POCKETS } from "./faces";

/** Gather what the light table shows, from the same content as the rest of the site. */
export async function getTableContent(): Promise<TableContent> {
  const [table, work, experiments, motion, logos, settings] = await Promise.all([
    getLightTable(),
    getWorkIndex(),
    getExperiments(),
    getMotionPage(),
    getLogosPage(),
    getSettings(),
  ]);
  const studies = work.featured.length ? work.featured : work.archive;
  return {
    slots: table.slots,
    tracks: table.tracks,
    studies: studies.slice(0, 3).map((s) => ({
      title: s.title,
      slug: s.slug,
      mark: s.mark?.url,
      sketch: s.sketch?.url,
    })),
    studyCount: work.featured.length + work.archive.length,
    experimentCount: experiments.length,
    motionTitles: motion.pieces.slice(0, 6).map((p) => p.title),
    logos: logos.logos.slice(0, SLIDE_POCKETS).map((l) => ({
      name: l.name,
      background: l.background,
      mark: l.mark?.url,
    })),
    wordmark: settings.wordmark?.url,
  };
}
