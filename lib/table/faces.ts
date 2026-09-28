/**
 * What's printed, drawn and taped on each object of the light table.
 * Everything visible is built from content, so it changes when Studio changes.
 */
import type { LightTableContent, TableObjectId } from "@/lib/content/types";
import type { Face, Prim } from "./draw";
import { FRAME, pencil, placements, TABLE_H, TABLE_W, tapeSize } from "./layout";

export const ink = {
  paper: "rgba(236,242,245,0.15)",
  paperEdge: "rgba(236,242,245,0.4)",
  graphite: "rgba(9,11,13,0.8)",
  graphiteSoft: "rgba(9,11,13,0.5)",
  blue: "#9ed4e8",
  glow: (a: number) => `rgba(220,234,241,${a})`,
  tape: "rgba(214,203,176,0.9)",
  tapeText: "#23211c",
  plastic: "#16191b",
  plasticEdge: "#3a3f42",
};

export type TableStudy = { title: string; slug: string; mark?: string; sketch?: string };
export type TableLogo = { name: string; background?: string; mark?: string };

/** Everything the table needs, small enough to hand to the browser for the 3D scene. */
export type TableContent = {
  slots: LightTableContent["slots"];
  tracks: string[];
  /** Featured case studies, in order. The first one's sketch and mark sit on top. */
  studies: TableStudy[];
  studyCount: number;
  experimentCount: number;
  motionTitles: string[];
  logos: TableLogo[];
  /** Endrit's wordmark, etched into the frame once it exists. */
  wordmark?: string;
};

/* ----------------------------------------------------------- tracing sheets */

const SHEET_W = placements.sheets.w;
const SHEET_H = placements.sheets.h;
const MARK_Y = 246;

function markSize(title: string) {
  return Math.round(Math.min(44, 290 / Math.max(1, title.length * 0.6)));
}

function registration(color: string): Prim[] {
  const marks: Prim[] = [];
  for (const [x, y] of [
    [22, 22],
    [SHEET_W - 22, 22],
    [22, SHEET_H - 22],
    [SHEET_W - 22, SHEET_H - 22],
  ]) {
    marks.push(
      { t: "circle", cx: x, cy: y, r: 6, stroke: color, sw: 1 },
      { t: "line", x1: x - 11, y1: y, x2: x + 11, y2: y, stroke: color, sw: 1 },
      { t: "line", x1: x, y1: y - 11, x2: x, y2: y + 11, stroke: color, sw: 1 },
    );
  }
  return marks;
}

const paper = (w: number, h: number): Prim => ({
  t: "rect",
  x: 0,
  y: 0,
  w,
  h,
  r: 2,
  fill: ink.paper,
  stroke: ink.paperEdge,
  sw: 1.2,
});

/** The finished mark, drawn on the sheet underneath. */
export function markSheet(study: TableStudy | undefined): Face {
  const prims: Prim[] = [paper(SHEET_W, SHEET_H), ...registration(ink.blue)];
  if (study?.mark) {
    prims.push({ t: "image", href: study.mark, x: 40, y: MARK_Y - 110, w: SHEET_W - 80, h: 180, o: 0.9 });
  } else if (study) {
    const size = markSize(study.title);
    prims.push({
      t: "text",
      x: SHEET_W / 2,
      y: MARK_Y,
      text: study.title,
      font: "sans",
      weight: 600,
      size,
      fill: ink.blue,
      anchor: "middle",
      ls: -0.01,
    });
  }
  return { w: SHEET_W, h: SHEET_H, prims };
}

/** The rough sketch on top. At rest it's out of register with the mark below. */
export function sketchSheet(study: TableStudy | undefined, index: number, count: number): Face {
  const prims: Prim[] = [paper(SHEET_W, SHEET_H), ...registration(ink.graphite)];
  if (study) {
    prims.push(
      { t: "text", x: 40, y: 72, text: study.title, font: "serif", italic: true, size: 30, fill: ink.graphite },
      {
        t: "text",
        x: 40,
        y: 94,
        text: `${String(index).padStart(2, "0")} · SKETCH`,
        font: "mono",
        size: 10,
        ls: 0.12,
        fill: ink.graphiteSoft,
      },
    );
  }
  if (study?.sketch) {
    prims.push({ t: "image", href: study.sketch, x: 40, y: MARK_Y - 110, w: SHEET_W - 80, h: 180, o: 0.85 });
  } else if (study) {
    // Construction lines that land exactly on the mark underneath once the sheets are in register.
    const size = markSize(study.title);
    const cap = size * 0.72;
    prims.push(
      {
        t: "rect",
        x: 34,
        y: MARK_Y - cap - 14,
        w: SHEET_W - 68,
        h: cap + 30,
        stroke: ink.graphiteSoft,
        sw: 1.2,
        dash: [6, 5],
      },
      { t: "path", d: `M26 ${MARK_Y + 1}c60 -2 140 2 210 -1s74 1 98 0`, stroke: ink.graphite, sw: 1.4, cap: "round" },
      { t: "path", d: `M26 ${MARK_Y - cap}c80 1 170 -2 308 1`, stroke: ink.graphiteSoft, sw: 1, cap: "round" },
      { t: "line", x1: SHEET_W / 2, y1: MARK_Y - cap - 40, x2: SHEET_W / 2, y2: MARK_Y + 44, stroke: ink.graphiteSoft, sw: 1, dash: [3, 4] },
      { t: "path", d: "M246 352c-6-26 34-40 50-18s-8 46-32 38-26-26-6-34", stroke: ink.graphite, sw: 1.3, cap: "round" },
      { t: "path", d: "M60 340l40 34m-30-40l40 34m-30-40l40 34", stroke: ink.graphiteSoft, sw: 1, cap: "round" },
    );
  }
  prims.push({
    t: "text",
    x: 40,
    y: SHEET_H - 40,
    text: `${String(index).padStart(2, "0")} / ${String(count).padStart(2, "0")}`,
    font: "mono",
    size: 10,
    ls: 0.12,
    fill: ink.graphiteSoft,
  });
  return { w: SHEET_W, h: SHEET_H, prims };
}

/** Another sheet further down the stack. Blank on purpose: the paper is translucent, and words would show through. */
export function spareSheet(): Face {
  return { w: SHEET_W, h: SHEET_H, prims: [paper(SHEET_W, SHEET_H)] };
}

/* ----------------------------------------------------------- contact sheet */

const CONTACT_COLS = 4;
const CONTACT_ROWS = 3;

function testFrame(i: number, x: number, y: number): Prim[] {
  const tone = [0.3, 0.22, 0.34, 0.26, 0.2, 0.32, 0.28, 0.24, 0.36, 0.22, 0.3, 0.26][i % 12];
  const g = ink.graphite;
  const body: Prim[] = [{ t: "rect", x, y, w: 80, h: 60, fill: ink.glow(tone) }];
  // Twelve small visual tests: circles, grids, bars, a letter, a curve.
  switch (i % 6) {
    case 0:
      body.push({ t: "circle", cx: x + 40, cy: y + 30, r: 16, fill: g });
      break;
    case 1:
      for (let k = 0; k < 5; k++) body.push({ t: "rect", x: x + 12 + k * 12, y: y + 14, w: 6, h: 32, fill: g, o: 0.3 + k * 0.14 });
      break;
    case 2:
      body.push({ t: "text", x: x + 40, y: y + 44, text: "a", font: "serif", italic: true, size: 40, fill: g, anchor: "middle" });
      break;
    case 3:
      for (let k = 0; k < 4; k++) for (let m = 0; m < 3; m++) body.push({ t: "rect", x: x + 14 + k * 14, y: y + 12 + m * 13, w: 8, h: 8, fill: g, o: (k + m) % 2 ? 0.8 : 0.3 });
      break;
    case 4:
      body.push({ t: "path", d: `M${x + 8} ${y + 46}C${x + 30} ${y - 4} ${x + 50} ${y + 64} ${x + 72} ${y + 14}`, stroke: g, sw: 3, cap: "round" });
      break;
    case 5:
      body.push({ t: "rect", x: x + 24, y: y + 14, w: 32, h: 32, stroke: g, sw: 3 }, { t: "rect", x: x + 32, y: y + 22, w: 16, h: 16, fill: g });
      break;
  }
  body.push({
    t: "text",
    x: x + 1,
    y: y + 72,
    text: String(i + 1).padStart(2, "0"),
    font: "mono",
    size: 9,
    fill: ink.glow(0.55),
  });
  return body;
}

export function contactSheet(experimentCount: number): Face {
  const w = placements.contact.w;
  const h = placements.contact.h;
  const prims: Prim[] = [
    { t: "rect", x: 0, y: 0, w, h, r: 2, fill: "rgba(12,14,16,0.72)", stroke: ink.glow(0.22), sw: 1 },
    {
      t: "text",
      x: 24,
      y: 26,
      text: experimentCount ? `TESTS · ${experimentCount}` : "TESTS",
      font: "mono",
      size: 10,
      ls: 0.14,
      fill: ink.glow(0.6),
    },
  ];
  for (let r = 0; r < CONTACT_ROWS; r++) {
    for (let c = 0; c < CONTACT_COLS; c++) prims.push(...testFrame(r * CONTACT_COLS + c, 24 + c * 92, 40 + r * 80));
  }
  // A china-marker circle around the one worth keeping.
  prims.push({
    t: "path",
    d: "M200 128c-14-10 16-22 56-20s64 14 58 34-44 30-78 28-54-18-44-36c6-8 18-12 30-12",
    stroke: "rgba(236,237,232,0.75)",
    sw: 3,
    cap: "round",
  });
  return { w, h, prims };
}

/* ------------------------------------------------------------------- loupe */

/** The loupe shows the contact sheet under it, magnified. */
export function loupeFace(contact: Face): Face {
  const L = placements.loupe;
  const C = placements.contact;
  const size = L.w;
  const c = size / 2;
  // The loupe's centre, in the contact sheet's own coordinates.
  const a = (-C.rot * Math.PI) / 180;
  const dx = L.cx - C.cx;
  const dy = L.cy - C.cy;
  const lx = dx * Math.cos(a) - dy * Math.sin(a) + C.w / 2;
  const ly = dx * Math.sin(a) + dy * Math.cos(a) + C.h / 2;
  const zoom = 2.2;
  return {
    w: size,
    h: size,
    prims: [
      { t: "circle", cx: c, cy: c, r: c - 1, fill: "#0c0e0f", stroke: ink.plasticEdge, sw: 2 },
      { t: "circle", cx: c, cy: c, r: c - 12, fill: ink.glow(0.34) },
      {
        t: "group",
        clip: { cx: c, cy: c, r: c - 12 },
        tx: c,
        ty: c,
        rot: C.rot - L.rot,
        s: zoom,
        prims: [{ t: "group", tx: -lx, ty: -ly, prims: contact.prims }],
      },
      { t: "circle", cx: c, cy: c, r: c - 12, stroke: "rgba(0,0,0,0.6)", sw: 3 },
      { t: "path", d: `M${c - 44} ${c - 24}a50 50 0 0 1 30 -24`, stroke: "rgba(255,255,255,0.35)", sw: 3, cap: "round" },
    ],
  };
}

/* -------------------------------------------------------------- slide page */

export const SLIDE_POCKETS = 20;

export function slidePage(logos: TableContent["logos"]): Face {
  const w = placements.slides.w;
  const h = placements.slides.h;
  const prims: Prim[] = [{ t: "rect", x: 0, y: 0, w, h, r: 3, fill: ink.glow(0.05), stroke: ink.glow(0.28), sw: 1 }];
  for (let i = 0; i < SLIDE_POCKETS; i++) {
    const x = 14 + (i % 4) * 70;
    const y = 20 + Math.floor(i / 4) * 72;
    prims.push({ t: "rect", x, y, w: 64, h: 64, stroke: ink.glow(0.16), sw: 1 });
    const logo = logos[i];
    if (!logo) continue;
    prims.push(
      { t: "rect", x: x + 3, y: y + 3, w: 58, h: 58, r: 3, fill: "#262b2e", stroke: "rgba(236,237,232,0.2)", sw: 1 },
      { t: "rect", x: x + 12, y: y + 14, w: 40, h: 28, fill: logo.background ?? ink.glow(0.62) },
    );
    if (logo.mark) {
      prims.push({ t: "image", href: logo.mark, x: x + 14, y: y + 16, w: 36, h: 24 });
    } else {
      prims.push({
        t: "text",
        x: x + 32,
        y: y + 35,
        text: logo.name.charAt(0),
        font: "sans",
        weight: 600,
        size: 17,
        fill: ink.graphite,
        anchor: "middle",
      });
    }
    prims.push({
      t: "text",
      x: x + 32,
      y: y + 54,
      text: logo.name.length > 11 ? `${logo.name.slice(0, 10)}…` : logo.name,
      font: "mono",
      size: 7,
      fill: "rgba(236,237,232,0.6)",
      anchor: "middle",
    });
  }
  return { w, h, prims };
}

/* --------------------------------------------------------------- film strip */

export const FILM_FRAMES = 5;

export function filmStrip(titles: string[]): Face {
  const w = placements.film.w;
  const h = placements.film.h;
  const prims: Prim[] = [{ t: "rect", x: 0, y: 0, w, h, fill: "#0a0b0c", stroke: "#24282a", sw: 1 }];
  for (let x = 6; x < w - 6; x += 18) {
    prims.push({ t: "rect", x, y: 7, w: 9, h: 7, r: 1.5, fill: ink.glow(0.8) });
    prims.push({ t: "rect", x, y: h - 14, w: 9, h: 7, r: 1.5, fill: ink.glow(0.8) });
  }
  const frameW = 90;
  const pitch = (w - 28 - frameW) / (FILM_FRAMES - 1);
  for (let i = 0; i < FILM_FRAMES; i++) {
    const x = 14 + i * pitch;
    const y = 24;
    prims.push({ t: "rect", x, y, w: frameW, h: 68, fill: ink.glow(0.3 + (i % 2) * 0.05) });
    // One motion study across the frames: a dot easing along an arc.
    const t = i / (FILM_FRAMES - 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const x0 = x + 10;
    const span = frameW - 20;
    prims.push(
      { t: "path", d: `M${x0} ${y + 56}Q${x0 + span / 2} ${y - 6} ${x0 + span} ${y + 56}`, stroke: ink.graphiteSoft, sw: 1, dash: [2, 3] },
      { t: "circle", cx: x0 + eased * span, cy: y + 56 - Math.sin(eased * Math.PI) * 31, r: 7, fill: ink.graphite },
      { t: "text", x: x + 2, y: 20, text: String(12 + i), font: "mono", size: 7, fill: ink.glow(0.45) },
    );
  }
  const caption = titles[0] ? titles[0].toUpperCase() : "MOTION";
  prims.push({ t: "text", x: w - 14, y: 20, text: `${caption} · 24 FPS`, font: "mono", size: 7, fill: ink.glow(0.45), anchor: "end" });
  return { w, h, prims };
}

/* ------------------------------------------------------------------ mixtape */

export function cassette(tracks: string[]): Face {
  const w = placements.tape.w;
  const h = placements.tape.h;
  const labelInk = "rgba(24,22,18,0.82)";
  const prims: Prim[] = [
    { t: "rect", x: 0, y: 0, w, h, r: 10, fill: ink.plastic, stroke: ink.plasticEdge, sw: 1.5 },
    { t: "rect", x: 16, y: 12, w: w - 32, h: 76, r: 4, fill: "#bdb6a4" },
    { t: "text", x: 26, y: 28, text: "SIDE A", font: "mono", size: 8, ls: 0.14, fill: labelInk },
  ];
  const lines = tracks.slice(0, 3);
  for (let i = 0; i < 3; i++) {
    const y = 46 + i * 15;
    prims.push({ t: "line", x1: 26, y1: y + 3, x2: w - 26, y2: y + 3, stroke: "rgba(24,22,18,0.18)", sw: 1 });
    if (lines[i]) {
      prims.push({ t: "text", x: 28, y, text: lines[i], font: "serif", italic: true, size: 13, fill: labelInk });
    }
  }
  prims.push(
    { t: "rect", x: 64, y: 96, w: w - 128, h: 38, r: 19, fill: ink.glow(0.32), stroke: "#0d0f10", sw: 2 },
    { t: "path", d: `M40 ${h}l14 -22h${w - 108}l14 22`, fill: "#111416", stroke: ink.plasticEdge, sw: 1 },
    { t: "circle", cx: 12, cy: 12, r: 3, fill: "#2a2e31" },
    { t: "circle", cx: w - 12, cy: 12, r: 3, fill: "#2a2e31" },
    { t: "circle", cx: 12, cy: h - 12, r: 3, fill: "#2a2e31" },
    { t: "circle", cx: w - 12, cy: h - 12, r: 3, fill: "#2a2e31" },
  );
  return { w, h, prims };
}

/** A tape reel. Drawn separately so it can turn. */
export const REEL = 34;
export const reelCentres = [
  { x: 96, y: 115 },
  { x: 164, y: 115 },
];

export function reel(): Face {
  const c = REEL / 2;
  const prims: Prim[] = [
    { t: "circle", cx: c, cy: c, r: c - 1, fill: "#0e1011", stroke: ink.glow(0.5), sw: 1 },
    { t: "circle", cx: c, cy: c, r: 6, fill: ink.glow(0.35) },
  ];
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    prims.push({ t: "line", x1: c + Math.cos(a) * 6, y1: c + Math.sin(a) * 6, x2: c + Math.cos(a) * 10, y2: c + Math.sin(a) * 10, stroke: "#0e1011", sw: 2 });
  }
  return { w: REEL, h: REEL, prims };
}

/* --------------------------------------------------------- tape labels etc */

export function tapeWidth(label: string) {
  return Math.max(tapeSize.w * 0.7, Math.round(28 + label.length * 9.6));
}

export function maskingTape(label: string): Face {
  const w = tapeWidth(label);
  const h = tapeSize.h;
  // Torn ends: a small zigzag down each short edge.
  const teeth = Math.floor(h / 4);
  let d = "M0 0";
  for (let i = 1; i <= teeth; i++) d += `L${i % 2 ? 3 : 0} ${i * 4}`;
  d += `L0 ${h}H${w}`;
  for (let i = 1; i <= teeth; i++) d += `L${w - (i % 2 ? 3 : 0)} ${h - i * 4}`;
  d += `L${w} 0Z`;
  return {
    w,
    h,
    prims: [
      { t: "path", d, fill: ink.tape },
      {
        t: "text",
        x: w / 2,
        y: h / 2 + 4.5,
        text: label.toUpperCase(),
        font: "mono",
        weight: 500,
        size: 13,
        ls: 0.12,
        fill: ink.tapeText,
        anchor: "middle",
      },
    ],
  };
}

export function pencilFace(): Face {
  const { w, h } = pencil;
  const tip = 46;
  return {
    w,
    h,
    prims: [
      { t: "rect", x: 0, y: 0, w: 22, h, r: 3, fill: "#3b4043" },
      { t: "rect", x: 20, y: 0, w: 14, h, fill: "#6d7174" },
      { t: "rect", x: 34, y: 0, w: w - 34 - tip, h, fill: "#1b1e20" },
      { t: "line", x1: 34, y1: h / 2, x2: w - tip, y2: h / 2, stroke: "#2b2f32", sw: 1 },
      { t: "path", d: `M${w - tip} 0L${w - 8} ${h / 2 - 2}V${h / 2 + 2}L${w - tip} ${h}Z`, fill: "#7c6d57" },
      { t: "path", d: `M${w - 14} ${h / 2 - 3.5}L${w} ${h / 2}L${w - 14} ${h / 2 + 3.5}Z`, fill: "#2a2c2e" },
    ],
  };
}

/* ------------------------------------------------------------ frame, glass */

export const GLASS_W = TABLE_W - FRAME * 2;
export const GLASS_H = TABLE_H - FRAME * 2;

export function frameFace(wordmark?: string): Face {
  const etched = "rgba(236,237,232,0.24)";
  const prims: Prim[] = [
    { t: "rect", x: 0, y: 0, w: TABLE_W, h: TABLE_H, r: 14, fill: "#15181a", stroke: "#2c3134", sw: 1.5 },
    { t: "rect", x: FRAME - 3, y: FRAME - 3, w: GLASS_W + 6, h: GLASS_H + 6, r: 2, fill: "#0a0b0c" },
    { t: "circle", cx: TABLE_W - FRAME - 8, cy: FRAME / 2, r: 3, fill: ink.glow(0.9) },
    {
      t: "text",
      x: TABLE_W - FRAME,
      y: TABLE_H - 12,
      text: "D50 · 5000 K",
      font: "mono",
      size: 11,
      ls: 0.2,
      fill: etched,
      anchor: "end",
    },
  ];
  if (wordmark) {
    prims.push({ t: "image", href: wordmark, x: FRAME, y: TABLE_H - 29, w: 140, h: 22, o: 0.4 });
  } else {
    prims.push({ t: "text", x: FRAME, y: TABLE_H - 12, text: "ENDRIT", font: "mono", size: 11, ls: 0.3, fill: etched });
  }
  return { w: TABLE_W, h: TABLE_H, prims };
}

/** The lit glass: a soft falloff, an etched grid and a ruler along the top edge. */
export function glassFace(): Face {
  const line = ink.glow(0.045);
  const prims: Prim[] = [
    {
      t: "glow",
      x: 0,
      y: 0,
      w: GLASS_W,
      h: GLASS_H,
      cx: GLASS_W / 2,
      cy: GLASS_H * 0.48,
      rx: GLASS_W * 0.7,
      ry: GLASS_H * 0.75,
      stops: [
        [0, "#3b474f"],
        [0.45, "#2b343a"],
        [1, "#1a2024"],
      ],
    },
  ];
  for (let x = 40; x < GLASS_W; x += 40) prims.push({ t: "line", x1: x, y1: 0, x2: x, y2: GLASS_H, stroke: line, sw: 1 });
  for (let y = 40; y < GLASS_H; y += 40) prims.push({ t: "line", x1: 0, y1: y, x2: GLASS_W, y2: y, stroke: line, sw: 1 });
  for (let x = 10; x < GLASS_W; x += 10) {
    const major = x % 100 === 0;
    const mid = x % 50 === 0;
    prims.push({ t: "line", x1: x, y1: 0, x2: x, y2: major ? 12 : mid ? 8 : 4, stroke: ink.glow(major ? 0.3 : 0.16), sw: 1 });
    if (major) prims.push({ t: "text", x: x + 3, y: 20, text: String(x / 10), font: "mono", size: 8, fill: ink.glow(0.3) });
  }
  for (const [x, y] of [
    [24, 40],
    [GLASS_W - 24, 40],
    [24, GLASS_H - 24],
    [GLASS_W - 24, GLASS_H - 24],
  ]) {
    prims.push(
      { t: "circle", cx: x, cy: y, r: 7, stroke: ink.glow(0.22), sw: 1 },
      { t: "line", x1: x - 13, y1: y, x2: x + 13, y2: y, stroke: ink.glow(0.22), sw: 1 },
      { t: "line", x1: x, y1: y - 13, x2: x, y2: y + 13, stroke: ink.glow(0.22), sw: 1 },
    );
  }
  return { w: GLASS_W, h: GLASS_H, prims };
}

/** The brighter patch of glass around whatever you're about to open. */
export function hoverGlowFace(): Face {
  const s = 256;
  return {
    w: s,
    h: s,
    prims: [
      {
        t: "glow",
        x: 0,
        y: 0,
        w: s,
        h: s,
        cx: s / 2,
        cy: s / 2,
        rx: s / 2,
        ry: s / 2,
        stops: [
          [0, "rgba(236,244,248,0.5)"],
          [0.5, "rgba(220,234,241,0.16)"],
          [1, "rgba(220,234,241,0)"],
        ],
      },
    ],
  };
}

/* ---------------------------------------------------------------- all faces */

export type TableFaces = {
  frame: Face;
  glass: Face;
  sheets: { spareA: Face; spareB: Face; mark: Face; sketch: Face };
  contact: Face;
  loupe: Face;
  slides: Face;
  film: Face;
  tape: Face;
  reel: Face;
  pencil: Face;
  labels: Record<TableObjectId, Face>;
};

export function buildFaces(content: TableContent): TableFaces {
  const [first] = content.studies;
  const contact = contactSheet(content.experimentCount);
  return {
    frame: frameFace(content.wordmark),
    glass: glassFace(),
    sheets: {
      spareA: spareSheet(),
      spareB: spareSheet(),
      mark: markSheet(first),
      sketch: sketchSheet(first, 1, Math.max(1, content.studies.length)),
    },
    contact,
    loupe: loupeFace(contact),
    slides: slidePage(content.logos),
    film: filmStrip(content.motionTitles),
    tape: cassette(content.tracks),
    reel: reel(),
    pencil: pencilFace(),
    labels: Object.fromEntries(
      Object.entries(content.slots).map(([id, slot]) => [id, maskingTape(slot.label)]),
    ) as Record<TableObjectId, Face>,
  };
}

/**
 * How the sheets sit in the stack, relative to the stack's centre.
 * The sketch starts out of register; hovering brings it into register with the mark.
 */
export const sheetStack = {
  spareA: { dx: 12, dy: 10, rot: 5 },
  spareB: { dx: -10, dy: 6, rot: -6 },
  mark: { dx: 0, dy: 0, rot: 0 },
  sketch: { dx: 18, dy: -14, rot: -4 },
} as const;
