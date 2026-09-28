import type { PortableTextBlock } from "next-sanity";
import type { SectionKey } from "@/lib/site";

export type { PortableTextBlock };

export type ImageRef = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  lqip?: string;
};

/** A Mux asset, resolved to what the player needs. */
export type VideoRef = {
  playbackId: string;
  aspectRatio?: string;
};

export type LottieRef = { url: string };

export type Swatch = { name: string; hex?: string; note?: string };

export type SocialLink = { label: string; url: string };

/** The story steps from the brief. A block can say which step it tells. */
export const storySteps = [
  "context",
  "problem",
  "obvious",
  "noticed",
  "connection",
  "development",
  "system",
  "applications",
  "result",
] as const;
export type StoryStep = (typeof storySteps)[number];

export const storyStepLabels: Record<StoryStep, string> = {
  context: "Context",
  problem: "Problem",
  obvious: "The obvious answer",
  noticed: "What I noticed",
  connection: "The Connection",
  development: "Identity development",
  system: "System",
  applications: "Applications",
  result: "Final result",
};

export type MediaLayout = "full" | "wide" | "inset" | "left" | "right";

type BlockBase = { _key: string };

export type TextBlock = BlockBase & {
  _type: "textBlock";
  step?: StoryStep;
  heading?: string;
  body: PortableTextBlock[];
};
export type StatementBlock = BlockBase & { _type: "statementBlock"; step?: StoryStep; text: string };
export type ImageBlock = BlockBase & {
  _type: "imageBlock";
  image?: ImageRef;
  caption?: string;
  layout?: MediaLayout;
  background?: string;
};
export type ImagePairBlock = BlockBase & {
  _type: "imagePair";
  left?: ImageRef;
  right?: ImageRef;
  caption?: string;
};
export type GalleryBlock = BlockBase & {
  _type: "gallery";
  images?: ImageRef[];
  columns?: 2 | 3 | 4;
  caption?: string;
};
export type VideoBlock = BlockBase & {
  _type: "videoBlock";
  video?: VideoRef;
  caption?: string;
  layout?: MediaLayout;
};
export type LottieBlock = BlockBase & {
  _type: "lottieBlock";
  lottie?: LottieRef;
  caption?: string;
  layout?: MediaLayout;
  background?: string;
};
/** The line a Connection draws over its mark, in percent of the mark's box. */
export type ConnectionLine = { x1: number; y1: number; x2: number; y2: number };
export type ConnectionBlock = BlockBase & {
  _type: "connectionBlock";
  statement: string;
  variant?: "statement" | "line" | "overlay";
  mark?: ImageRef;
  line?: ConnectionLine;
  firstRead?: ImageRef;
  secondRead?: ImageRef;
  note?: string;
};
export type BeforeAfterBlock = BlockBase & {
  _type: "beforeAfter";
  before?: ImageRef;
  after?: ImageRef;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
};
export type PaletteBlock = BlockBase & { _type: "paletteBlock"; heading?: string; colors: Swatch[] };
export type TypeBlock = BlockBase & {
  _type: "typeBlock";
  typeface: string;
  sample?: string;
  note?: string;
  image?: ImageRef;
};
export type QuoteBlock = BlockBase & { _type: "quoteBlock"; quote: string; attribution?: string };
export type ApplicationsBlock = BlockBase & {
  _type: "applicationsBlock";
  heading?: string;
  items?: { _key: string; image?: ImageRef; label?: string }[];
};
export type StepsBlock = BlockBase & {
  _type: "stepsBlock";
  heading?: string;
  steps: { _key: string; label: string; text?: string; color?: string; image?: ImageRef }[];
};
export type SpacerBlock = BlockBase & { _type: "spacerBlock"; size?: "s" | "m" | "l" };

export type Block =
  | TextBlock
  | StatementBlock
  | ImageBlock
  | ImagePairBlock
  | GalleryBlock
  | VideoBlock
  | LottieBlock
  | ConnectionBlock
  | BeforeAfterBlock
  | PaletteBlock
  | TypeBlock
  | QuoteBlock
  | ApplicationsBlock
  | StepsBlock
  | SpacerBlock;

export type CaseStudySummary = {
  _id: string;
  title: string;
  slug: string;
  client?: string;
  year?: number;
  sector?: string;
  /** The Connection in one sentence. Shown in the skim layer and on the index. */
  connection: string;
  /** One-line mood, instead of a dry label. */
  mood?: string;
  cover?: ImageRef;
  coverVideo?: VideoRef;
  /** The finished mark. It sits under the sketch on the light table. */
  mark?: ImageRef;
  /** A rough sketch of the mark, for the top tracing sheet. */
  sketch?: ImageRef;
  accent?: string;
};

export type CaseStudy = CaseStudySummary & {
  role?: string;
  deliverables?: string[];
  credits?: { studio?: string; collaborators?: string[] };
  blocks: Block[];
  seo?: { title?: string; description?: string; image?: ImageRef };
};

export type ExperimentLabel = "personal" | "self-initiated";

export type ExperimentSummary = {
  _id: string;
  title: string;
  slug: string;
  label: ExperimentLabel;
  question?: string;
  year?: number;
  tags?: string[];
  cover?: ImageRef;
  coverVideo?: VideoRef;
};

export type Experiment = ExperimentSummary & { blocks: Block[] };

export type MotionPiece = {
  _key: string;
  title: string;
  year?: number;
  client?: string;
  note?: string;
  aspect?: "1:1" | "4:5" | "16:9" | "9:16";
  video?: VideoRef;
  lottie?: LottieRef;
  poster?: ImageRef;
};

export type Logo = {
  _key: string;
  name: string;
  year?: number;
  note?: string;
  mark?: ImageRef;
  background?: string;
  caseStudySlug?: string;
};

export type FunItem =
  | { _key: string; _type: "funImage"; image?: ImageRef; caption?: string }
  | { _key: string; _type: "funTrack"; title: string; artist?: string; url?: string; note?: string }
  | { _key: string; _type: "funNote"; text: string };

export type Settings = {
  email: string;
  availability: { open: boolean; line: string };
  socials: SocialLink[];
  wordmark?: ImageRef;
  workIntro?: string;
  experimentsIntro?: string;
  contactIntro?: string;
};

/** The objects on the light table. The objects are code; what they open is content. */
export const tableObjectIds = ["sheets", "contact", "loupe", "slides", "film", "tape"] as const;
export type TableObjectId = (typeof tableObjectIds)[number];

export type TableSlot = { section: SectionKey; label: string; note?: string };

export type LightTableContent = {
  slots: Record<TableObjectId, TableSlot>;
  /** Written on the mixtape's J-card. */
  tracks: string[];
};

export type AboutPage = { headline: string; body: PortableTextBlock[]; location?: string };
export type MotionPage = { intro?: string; pieces: MotionPiece[] };
export type LogosPage = { intro?: string; logos: Logo[] };
export type FunPage = { intro?: string; items: FunItem[] };

export type WorkIndex = { featured: CaseStudySummary[]; archive: CaseStudySummary[] };
