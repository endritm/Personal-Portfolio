/**
 * Seed content, used whenever Sanity isn't configured (local dev, previews, tests).
 *
 * Everything here comes from the brief. Nothing is invented: no Connections, years,
 * roles or colours that Endrit hasn't given. Empty fields stay empty and the UI hides them.
 * Real content lives in /studio.
 */
import type {
  AboutPage,
  Block,
  CaseStudy,
  Experiment,
  FunPage,
  LightTableContent,
  LogosPage,
  MotionPage,
  PortableTextBlock,
  Settings,
} from "./types";

let keySeed = 0;
const key = () => `seed${(keySeed++).toString(36)}`;

/** Plain paragraphs to Portable Text. */
export function paragraphs(...texts: string[]): PortableTextBlock[] {
  return texts.map((text) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  }));
}

const connection = (statement: string, variant: "statement" | "line" = "statement"): Block => ({
  _type: "connectionBlock",
  _key: key(),
  statement,
  variant,
});

const steps = (heading: string, labels: string[]): Block => ({
  _type: "stepsBlock",
  _key: key(),
  heading,
  steps: labels.map((label) => ({ _key: key(), label })),
});

type SeedStudy = Omit<CaseStudy, "_id" | "blocks"> & { blocks?: Block[] };

function study(s: SeedStudy): CaseStudy {
  return {
    _id: `seed.caseStudy.${s.slug}`,
    client: s.title,
    ...s,
    blocks: s.blocks ?? [connection(s.connection)],
  };
}

/** Featured, in the order from the brief. */
export const featuredSlugs = ["fado-engineering", "flytik", "tripsim", "kosovanet", "tsc-building"];

export const caseStudies: CaseStudy[] = [
  study({
    title: "Fado Engineering",
    slug: "fado-engineering",
    sector: "Infrastructure engineering",
    connection: "A hidden line runs through the wordmark.",
    blocks: [connection("A hidden line runs through the wordmark.", "line")],
  }),
  study({
    title: "Flytik",
    slug: "flytik",
    sector: "Airline ticket agency",
    connection: "“Tik” means both the confirmation tick and “ticket”.",
  }),
  study({
    title: "TripSIM",
    slug: "tripsim",
    sector: "International eSIM provider",
    connection:
      "The symbol is the product itself: a T for Trip, built inside a SIM card and dissolving into a pixel grid that reads as a QR code.",
    blocks: [
      connection(
        "The symbol is the product itself: a T for Trip, built inside a SIM card and dissolving into a pixel grid that reads as a QR code.",
      ),
      {
        _type: "stepsBlock",
        _key: key(),
        heading: "Three colours, three steps of using it",
        steps: [
          { _key: key(), label: "Choose", text: "SIM Blue" },
          { _key: key(), label: "Scan", text: "Scan Orange" },
          { _key: key(), label: "Online", text: "Trip Green" },
        ],
      },
    ],
  }),
  study({
    title: "KosovaNet",
    slug: "kosovanet",
    sector: "Fiber optic internet provider",
    connection:
      "The letters of KOSOVA are built from little homes and corners, and a line from the K resolves into a light symbol for fiber optics.",
  }),
  study({
    title: "TSC Building",
    slug: "tsc-building",
    sector: "Building engineers",
    connection: "A three-part circle that becomes more complete with each stage: think, speak, create.",
    blocks: [
      connection("A three-part circle that becomes more complete with each stage: think, speak, create."),
      steps("Every project, in three stages", ["Think", "Speak", "Create"]),
    ],
  }),
  study({
    title: "Gashi",
    slug: "gashi",
    sector: "Landscaping, pavement and excavation",
    connection: "An excavator arm hidden in the G.",
  }),
  study({
    title: "Matin Home",
    slug: "matin-home",
    sector: "Tiles",
    connection: "A tile built into the letter M.",
  }),
  study({
    title: "BUA",
    slug: "bua",
    deliverables: ["Naming", "Brand identity"],
    connection: "The four snakes of the old Bua family heraldry, simplified into one symbol.",
  }),
  study({
    title: "Aktive Real Estate",
    slug: "aktive-real-estate",
    sector: "Real estate",
    connection: "The A’s crossbar is slanted and pops out, because the company is active. It still reads as an A.",
  }),
  study({
    title: "Toni Color",
    slug: "toni-color",
    sector: "Home renovation and painting",
    connection: "The T is a splash of colour, but controlled and precise.",
  }),
  study({
    title: "Flawless",
    slug: "flawless",
    sector: "Event decor, gifts and photography",
    connection: "The brief asked for an E. The work was making one letter feel like a luxury monogram.",
    blocks: [
      connection("The brief asked for an E. The work was making one letter feel like a luxury monogram."),
      steps("Four service colours, one brand holding four businesses", ["Decor", "Events", "Gifts", "Photos"]),
    ],
  }),
];

export const experiments: Experiment[] = [];

export const settings: Settings = {
  // Placeholder. Set the real address in Studio → Settings.
  email: "hello@example.com",
  availability: { open: true, line: "Open for projects" },
  socials: [],
  workIntro: "Brand identities, and the idea inside each one.",
  experimentsIntro: "Client work begins with a problem. Experiments begin with a question.",
  contactIntro: "Tell me what the company actually does. I'll look for what it hasn't noticed yet.",
};

export const lightTable: LightTableContent = {
  slots: {
    sheets: { section: "work", label: "Work", note: "Brand identities, and the idea inside each one." },
    contact: { section: "experiments", label: "Experiments", note: "Things that start with a question." },
    film: { section: "motion", label: "Motion", note: "Identities that move." },
    slides: { section: "logos", label: "Logos", note: "Marks, one to a slide." },
    tape: { section: "fun", label: "Fun", note: "What I make and play when nobody's asking." },
    loupe: { section: "about", label: "About", note: "Why I look twice." },
  },
  tracks: [],
};

export const about: AboutPage = {
  headline: "I think deeper than the deliverable.",
  // Endrit's own voice sample from the brief, used until the real About is written.
  body: paragraphs(
    "Every brand I design starts with a question nobody asked. What does this company actually do, underneath what it says it does? Somewhere in that answer there’s a connection hiding. A line through a wordmark. An excavator arm inside a G. Once I find it, the identity stops being a choice and becomes obvious. Then I get obsessive about making it look right.",
  ),
  location: "Based in Gjilan, Kosovo. Working wherever the interesting problems are.",
};

export const motionPage: MotionPage = { intro: "Identities that move. Short pieces, no showreels.", pieces: [] };

export const logosPage: LogosPage = {
  intro: "Marks, one to a slide.",
  logos: caseStudies.map((s) => ({ _key: `logo-${s.slug}`, name: s.title, caseStudySlug: s.slug })),
};

export const funPage: FunPage = { intro: "Designing for fun, and what's playing while I do.", items: [] };
