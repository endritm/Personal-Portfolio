import { CanvasTexture, LinearFilter, SRGBColorSpace, type Texture } from "three";
import { collectImageHrefs, drawFace, type Face, type FontFamilies } from "@/lib/table/draw";

function loadImage(src: string, timeout = 6000): Promise<[string, HTMLImageElement] | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    const timer = window.setTimeout(() => resolve(null), timeout);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve([src, img]);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

/** Wait for the faces the canvases will use, so textures match the flat table's type. */
export async function loadFonts(fonts: FontFamilies) {
  if (!("fonts" in document)) return;
  await Promise.allSettled([
    document.fonts.load(`italic 400 30px ${fonts.serif}`),
    document.fonts.load(`400 30px ${fonts.serif}`),
    document.fonts.load(`600 30px ${fonts.sans}`),
    document.fonts.load(`400 12px ${fonts.mono}`),
    document.fonts.load(`500 13px ${fonts.mono}`),
  ]);
  await document.fonts.ready;
}

/**
 * Render every face to a canvas texture, at `pxPerUnit` device pixels per table unit.
 * Rendering at the size it's shown (and skipping mipmaps) keeps hairline pencil work crisp.
 */
export async function facesToTextures<K extends string>(
  faces: Record<K, Face>,
  fonts: FontFamilies,
  pxPerUnit: number,
  maxTextureSize: number,
): Promise<Record<K, Texture>> {
  await loadFonts(fonts);
  const hrefs = new Set<string>();
  for (const face of Object.values<Face>(faces)) collectImageHrefs(face.prims, hrefs);
  const loaded = await Promise.all([...hrefs].map((h) => loadImage(h)));
  const images = new Map(loaded.filter((x): x is [string, HTMLImageElement] => x !== null));

  const out = {} as Record<K, Texture>;
  for (const key of Object.keys(faces) as K[]) {
    const face = faces[key];
    const scale = Math.min(pxPerUnit, Math.min(4096, maxTextureSize) / Math.max(face.w, face.h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(face.w * scale);
    canvas.height = Math.ceil(face.h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    drawFace(ctx, face, scale, fonts, images);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    out[key] = texture;
  }
  return out;
}
