/**
 * A tiny drawing vocabulary for the light table.
 *
 * Each object's face is described once as a list of primitives, then rendered two ways:
 * to SVG for the server-rendered table (works without JavaScript), and to a canvas for
 * the 3D scene's textures. One description keeps the two identical, so the 3D table can
 * fade in over the flat one without a visible jump.
 */

export type FontKey = "serif" | "sans" | "mono";

type Stroke = { stroke?: string; sw?: number; dash?: number[]; cap?: "butt" | "round" | "square" };
type Common = { o?: number };

export type Prim =
  | ({ t: "rect"; x: number; y: number; w: number; h: number; r?: number; fill?: string } & Stroke & Common)
  | ({ t: "circle"; cx: number; cy: number; r: number; fill?: string } & Stroke & Common)
  | ({ t: "line"; x1: number; y1: number; x2: number; y2: number } & Stroke & Common)
  | ({ t: "path"; d: string; fill?: string } & Stroke & Common)
  | ({
      t: "text";
      x: number;
      y: number;
      text: string;
      font: FontKey;
      size: number;
      fill: string;
      weight?: number;
      italic?: boolean;
      anchor?: "start" | "middle" | "end";
      /** Letter spacing in em. */
      ls?: number;
    } & Common)
  | ({ t: "image"; href: string; x: number; y: number; w: number; h: number } & Common)
  /** A rect filled with an elliptical radial gradient. */
  | ({
      t: "glow";
      x: number;
      y: number;
      w: number;
      h: number;
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      stops: [offset: number, color: string][];
    } & Common)
  | ({ t: "group"; prims: Prim[]; tx?: number; ty?: number; rot?: number; s?: number; clip?: ClipCircle } & Common);

export type ClipCircle = { cx: number; cy: number; r: number };

export type Face = { w: number; h: number; prims: Prim[] };

const escapeMap: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeXml = (s: string) => s.replace(/[&<>"']/g, (c) => escapeMap[c]);

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ""));

const cssFont: Record<FontKey, string> = { serif: "var(--serif)", sans: "var(--sans)", mono: "var(--mono)" };

function strokeAttrs(p: Stroke & Common) {
  let a = "";
  if (p.stroke) a += ` stroke="${p.stroke}" stroke-width="${fmt(p.sw ?? 1)}"`;
  if (p.dash) a += ` stroke-dasharray="${p.dash.map(fmt).join(" ")}"`;
  if (p.cap) a += ` stroke-linecap="${p.cap}"`;
  if (p.o !== undefined && p.o !== 1) a += ` opacity="${fmt(p.o)}"`;
  return a;
}

let clipCounter = 0;

function primToSvg(p: Prim, idPrefix: string): string {
  switch (p.t) {
    case "rect":
      return `<rect x="${fmt(p.x)}" y="${fmt(p.y)}" width="${fmt(p.w)}" height="${fmt(p.h)}"${p.r ? ` rx="${fmt(p.r)}"` : ""} fill="${p.fill ?? "none"}"${strokeAttrs(p)}/>`;
    case "circle":
      return `<circle cx="${fmt(p.cx)}" cy="${fmt(p.cy)}" r="${fmt(p.r)}" fill="${p.fill ?? "none"}"${strokeAttrs(p)}/>`;
    case "line":
      return `<line x1="${fmt(p.x1)}" y1="${fmt(p.y1)}" x2="${fmt(p.x2)}" y2="${fmt(p.y2)}"${strokeAttrs(p)}/>`;
    case "path":
      return `<path d="${p.d}" fill="${p.fill ?? "none"}"${strokeAttrs(p)}/>`;
    case "text": {
      const style = [
        `font-family:${cssFont[p.font]}`,
        `font-size:${fmt(p.size)}px`,
        `font-weight:${p.weight ?? 400}`,
        p.italic ? "font-style:italic" : "",
        p.ls ? `letter-spacing:${fmt(p.ls)}em` : "",
      ]
        .filter(Boolean)
        .join(";");
      const anchor = p.anchor && p.anchor !== "start" ? ` text-anchor="${p.anchor}"` : "";
      const o = p.o !== undefined && p.o !== 1 ? ` opacity="${fmt(p.o)}"` : "";
      return `<text x="${fmt(p.x)}" y="${fmt(p.y)}" fill="${p.fill}"${anchor}${o} style="${style}">${escapeXml(p.text)}</text>`;
    }
    case "image": {
      const o = p.o !== undefined && p.o !== 1 ? ` opacity="${fmt(p.o)}"` : "";
      return `<image href="${escapeXml(p.href)}" x="${fmt(p.x)}" y="${fmt(p.y)}" width="${fmt(p.w)}" height="${fmt(p.h)}" preserveAspectRatio="xMidYMid meet"${o}/>`;
    }
    case "glow": {
      const id = `${idPrefix}g${clipCounter++}`;
      const stops = p.stops.map(([off, color]) => `<stop offset="${fmt(off)}" stop-color="${color}"/>`).join("");
      const o = p.o !== undefined && p.o !== 1 ? ` opacity="${fmt(p.o)}"` : "";
      const transform = `translate(${fmt(p.cx)} ${fmt(p.cy)}) scale(1 ${fmt(p.ry / p.rx)}) translate(${fmt(-p.cx)} ${fmt(-p.cy)})`;
      return `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${fmt(p.cx)}" cy="${fmt(p.cy)}" r="${fmt(p.rx)}" gradientTransform="${transform}">${stops}</radialGradient></defs><rect x="${fmt(p.x)}" y="${fmt(p.y)}" width="${fmt(p.w)}" height="${fmt(p.h)}" fill="url(#${id})"${o}/>`;
    }
    case "group": {
      const transforms = [
        p.tx || p.ty ? `translate(${fmt(p.tx ?? 0)} ${fmt(p.ty ?? 0)})` : "",
        p.rot ? `rotate(${fmt(p.rot)})` : "",
        p.s && p.s !== 1 ? `scale(${fmt(p.s)})` : "",
      ]
        .filter(Boolean)
        .join(" ");
      let clipDef = "";
      let clipAttr = "";
      if (p.clip) {
        const id = `${idPrefix}c${clipCounter++}`;
        clipDef = `<clipPath id="${id}"><circle cx="${fmt(p.clip.cx)}" cy="${fmt(p.clip.cy)}" r="${fmt(p.clip.r)}"/></clipPath>`;
        clipAttr = ` clip-path="url(#${id})"`;
      }
      const inner = p.prims.map((c) => primToSvg(c, idPrefix)).join("");
      const o = p.o !== undefined && p.o !== 1 ? ` opacity="${fmt(p.o)}"` : "";
      // The clip is applied in the parent's space, so it wraps the transformed group.
      const g = `<g${transforms ? ` transform="${transforms}"` : ""}${o}>${inner}</g>`;
      return clipDef ? `${clipDef}<g${clipAttr}>${g}</g>` : g;
    }
  }
}

/** Inner SVG markup for a face. Wrap it in an <svg viewBox="0 0 w h">. */
export function faceToSvg(face: Face, idPrefix = "f"): string {
  return face.prims.map((p) => primToSvg(p, idPrefix)).join("");
}

/* ------------------------------------------------------------------ canvas */

export type FontFamilies = Record<FontKey, string>;

function applyStroke(ctx: CanvasRenderingContext2D, p: Stroke) {
  ctx.lineWidth = p.sw ?? 1;
  ctx.setLineDash(p.dash ?? []);
  ctx.lineCap = p.cap ?? "butt";
  ctx.strokeStyle = p.stroke ?? "transparent";
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (r > 0) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function drawPrim(ctx: CanvasRenderingContext2D, p: Prim, fonts: FontFamilies, images: Map<string, HTMLImageElement>) {
  ctx.save();
  if (p.o !== undefined) ctx.globalAlpha *= p.o;
  switch (p.t) {
    case "rect":
      roundRectPath(ctx, p.x, p.y, p.w, p.h, p.r ?? 0);
      if (p.fill) {
        ctx.fillStyle = p.fill;
        ctx.fill();
      }
      if (p.stroke) {
        applyStroke(ctx, p);
        ctx.stroke();
      }
      break;
    case "circle":
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
      if (p.fill) {
        ctx.fillStyle = p.fill;
        ctx.fill();
      }
      if (p.stroke) {
        applyStroke(ctx, p);
        ctx.stroke();
      }
      break;
    case "line":
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      applyStroke(ctx, p);
      ctx.stroke();
      break;
    case "path": {
      const path = new Path2D(p.d);
      if (p.fill) {
        ctx.fillStyle = p.fill;
        ctx.fill(path);
      }
      if (p.stroke) {
        applyStroke(ctx, p);
        ctx.stroke(path);
      }
      break;
    }
    case "text": {
      ctx.font = `${p.italic ? "italic " : ""}${p.weight ?? 400} ${p.size}px ${fonts[p.font]}`;
      ctx.fillStyle = p.fill;
      ctx.textAlign = p.anchor === "middle" ? "center" : p.anchor === "end" ? "right" : "left";
      ctx.textBaseline = "alphabetic";
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${(p.ls ?? 0) * p.size}px`;
      ctx.fillText(p.text, p.x, p.y);
      break;
    }
    case "image": {
      const img = images.get(p.href);
      if (img && img.naturalWidth > 0) {
        // Match SVG's preserveAspectRatio="xMidYMid meet".
        const scale = Math.min(p.w / img.naturalWidth, p.h / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, p.x + (p.w - w) / 2, p.y + (p.h - h) / 2, w, h);
      }
      break;
    }
    case "glow": {
      const k = p.ry / p.rx;
      ctx.translate(p.cx, p.cy);
      ctx.scale(1, k);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.rx);
      for (const [off, color] of p.stops) gradient.addColorStop(off, color);
      ctx.fillStyle = gradient;
      ctx.fillRect(p.x - p.cx, (p.y - p.cy) / k, p.w, p.h / k);
      break;
    }
    case "group":
      if (p.clip) {
        ctx.beginPath();
        ctx.arc(p.clip.cx, p.clip.cy, p.clip.r, 0, Math.PI * 2);
        ctx.clip();
      }
      ctx.translate(p.tx ?? 0, p.ty ?? 0);
      if (p.rot) ctx.rotate((p.rot * Math.PI) / 180);
      if (p.s) ctx.scale(p.s, p.s);
      for (const c of p.prims) drawPrim(ctx, c, fonts, images);
      break;
  }
  ctx.restore();
}

export function collectImageHrefs(prims: Prim[], into = new Set<string>()): Set<string> {
  for (const p of prims) {
    if (p.t === "image") into.add(p.href);
    else if (p.t === "group") collectImageHrefs(p.prims, into);
  }
  return into;
}

/** Draw a face onto a canvas at `scale` pixels per table unit. */
export function drawFace(
  ctx: CanvasRenderingContext2D,
  face: Face,
  scale: number,
  fonts: FontFamilies,
  images: Map<string, HTMLImageElement> = new Map(),
) {
  ctx.save();
  ctx.scale(scale, scale);
  for (const p of face.prims) drawPrim(ctx, p, fonts, images);
  ctx.restore();
}
