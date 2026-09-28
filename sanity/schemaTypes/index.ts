import { blockTypes } from "./blocks";
import { caseStudy, experiment } from "./documents";
import { about, funPage, lightTable, logosPage, motionPage, settings } from "./singletons";

export const singletons = [
  { type: "lightTable", title: "Light table" },
  { type: "motionPage", title: "Motion" },
  { type: "logosPage", title: "Logos" },
  { type: "funPage", title: "Fun" },
  { type: "about", title: "About" },
  { type: "settings", title: "Settings" },
] as const;

/** Singletons use their type as their document ID. */
export const singletonTypes = new Set<string>(singletons.map((s) => s.type));

export const schemaTypes = [
  caseStudy,
  experiment,
  settings,
  lightTable,
  about,
  motionPage,
  logosPage,
  funPage,
  ...blockTypes,
];
