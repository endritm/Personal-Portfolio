/**
 * Where everything sits on the light table, in table units.
 * The table is 1600 × 1000; the flat table, the 3D table and the tests all read from here.
 */
import type { TableObjectId } from "@/lib/content/types";

export const TABLE_W = 1600;
export const TABLE_H = 1000;
/** The aluminium frame around the glass. */
export const FRAME = 34;

export type Placement = {
  /** Centre, in table units. */
  cx: number;
  cy: number;
  w: number;
  h: number;
  /** Degrees, clockwise, as on screen. */
  rot: number;
  /** Height above the glass in the 3D scene. */
  z: number;
  /** Where the masking-tape label sits, relative to the object's top-left corner. */
  tape: { x: number; y: number; rot: number };
};

export const placements: Record<TableObjectId, Placement> = {
  sheets: { cx: 400, cy: 486, w: 360, h: 460, rot: -3, z: 2, tape: { x: 22, y: -16, rot: -4 } },
  contact: { cx: 850, cy: 292, w: 400, h: 290, rot: 2, z: 1, tape: { x: 18, y: -16, rot: 3 } },
  loupe: { cx: 1004, cy: 392, w: 150, h: 150, rot: 0, z: 40, tape: { x: 96, y: 132, rot: -8 } },
  slides: { cx: 1330, cy: 334, w: 300, h: 384, rot: -2, z: 1, tape: { x: 150, y: -16, rot: 2 } },
  film: { cx: 890, cy: 736, w: 520, h: 116, rot: -6, z: 2, tape: { x: 24, y: -18, rot: -2 } },
  tape: { cx: 1318, cy: 764, w: 260, h: 166, rot: 4, z: 14, tape: { x: 120, y: -18, rot: -3 } },
};

/** Not a link. It's there because a real table has one. */
export const pencil = { cx: 596, cy: 884, w: 330, h: 18, rot: -16 };

export const tapeSize = { w: 128, h: 30 };

/** Axis-aligned bounds of a rotated placement. */
export function bounds(p: Pick<Placement, "cx" | "cy" | "w" | "h" | "rot">) {
  const a = (p.rot * Math.PI) / 180;
  const hw = (Math.abs(p.w * Math.cos(a)) + Math.abs(p.h * Math.sin(a))) / 2;
  const hh = (Math.abs(p.w * Math.sin(a)) + Math.abs(p.h * Math.cos(a))) / 2;
  return { left: p.cx - hw, right: p.cx + hw, top: p.cy - hh, bottom: p.cy + hh };
}

/** Percent box for positioning a placement in the flat table. */
export function percentBox(p: Pick<Placement, "cx" | "cy" | "w" | "h">) {
  return {
    left: ((p.cx - p.w / 2) / TABLE_W) * 100,
    top: ((p.cy - p.h / 2) / TABLE_H) * 100,
    width: (p.w / TABLE_W) * 100,
    height: (p.h / TABLE_H) * 100,
  };
}

/** Table units (origin top-left, y down) to 3D world units (origin centre, y up). */
export function toWorld(x: number, y: number): [number, number] {
  return [x - TABLE_W / 2, TABLE_H / 2 - y];
}
