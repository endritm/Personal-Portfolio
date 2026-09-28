import { describe, expect, it } from "vitest";
import { tableObjectIds } from "@/lib/content/types";
import * as seed from "@/lib/content/seed";
import { escapeXml, faceToSvg, type Face } from "./draw";
import { buildFaces, maskingTape, SLIDE_POCKETS, type TableContent } from "./faces";
import { bounds, FRAME, pencil, percentBox, placements, TABLE_H, TABLE_W, toWorld } from "./layout";

const content: TableContent = {
  slots: seed.lightTable.slots,
  tracks: ["Track one", "Track <two> & three"],
  studies: seed.caseStudies.slice(0, 3).map((s) => ({ title: s.title, slug: s.slug })),
  studyCount: seed.caseStudies.length,
  experimentCount: 0,
  motionTitles: [],
  logos: seed.logosPage.logos.map((l) => ({ name: l.name })),
};

describe("table layout", () => {
  it("keeps every object on the glass", () => {
    for (const id of tableObjectIds) {
      const b = bounds(placements[id]);
      expect(b.left, id).toBeGreaterThanOrEqual(FRAME);
      expect(b.top, id).toBeGreaterThanOrEqual(FRAME);
      expect(b.right, id).toBeLessThanOrEqual(TABLE_W - FRAME);
      expect(b.bottom, id).toBeLessThanOrEqual(TABLE_H - FRAME);
    }
    const p = bounds(pencil);
    expect(p.right).toBeLessThanOrEqual(TABLE_W - FRAME);
    expect(p.bottom).toBeLessThanOrEqual(TABLE_H - FRAME);
  });

  it("keeps objects apart, except the loupe resting on the contact sheet", () => {
    const overlaps = (a: ReturnType<typeof bounds>, b: ReturnType<typeof bounds>) =>
      a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    for (const a of tableObjectIds) {
      for (const b of tableObjectIds) {
        if (a >= b) continue;
        const pair = [a, b].sort().join("+");
        const expected = pair === "contact+loupe";
        expect(overlaps(bounds(placements[a]), bounds(placements[b])), pair).toBe(expected);
      }
    }
  });

  it("converts table units to percent boxes and world space", () => {
    expect(percentBox({ cx: 800, cy: 500, w: 160, h: 100 })).toEqual({ left: 45, top: 45, width: 10, height: 10 });
    expect(toWorld(0, 0)).toEqual([-800, 500]);
    expect(toWorld(800, 500)).toEqual([0, 0]);
  });
});

describe("table faces", () => {
  const faces = buildFaces(content);

  it("labels every object with its section", () => {
    for (const id of tableObjectIds) {
      const svg = faceToSvg(faces.labels[id]);
      expect(svg).toContain(content.slots[id].label.toUpperCase());
    }
  });

  it("puts the first featured study on the top sheets", () => {
    expect(faceToSvg(faces.sheets.sketch)).toContain("Fado Engineering");
    expect(faceToSvg(faces.sheets.mark)).toContain("Fado Engineering");
    expect(faceToSvg(faces.sheets.spareB)).not.toContain("<text");
  });

  it("fills at most twenty slide pockets", () => {
    const many = { ...content, logos: Array.from({ length: 30 }, (_, i) => ({ name: `Mark ${i}` })) };
    const svg = faceToSvg(buildFaces(many).slides);
    expect(svg).toContain("Mark 19");
    expect(svg).not.toContain("Mark 20");
    expect(SLIDE_POCKETS).toBe(20);
  });

  it("escapes content written onto the table", () => {
    const svg = faceToSvg(faces.tape);
    expect(svg).toContain("Track &lt;two&gt; &amp; three");
    expect(svg).not.toContain("<two>");
    expect(escapeXml(`"a" & 'b'`)).toBe("&quot;a&quot; &amp; &#39;b&#39;");
  });

  it("sizes masking tape to its label", () => {
    expect(maskingTape("Experiments").w).toBeGreaterThan(maskingTape("Fun").w);
  });

  it("magnifies the part of the contact sheet under the loupe", () => {
    const lens = faces.loupe.prims.find((p) => p.t === "group");
    expect(lens?.t).toBe("group");
    if (lens?.t !== "group") return;
    const inner = lens.prims[0];
    if (inner.t !== "group") throw new Error("expected nested group");
    // The lens centre maps back to the loupe's position in contact-sheet coordinates.
    const L = placements.loupe;
    const C = placements.contact;
    const a = (-C.rot * Math.PI) / 180;
    const dx = L.cx - C.cx;
    const dy = L.cy - C.cy;
    expect(-(inner.tx ?? 0)).toBeCloseTo(dx * Math.cos(a) - dy * Math.sin(a) + C.w / 2, 5);
    expect(-(inner.ty ?? 0)).toBeCloseTo(dx * Math.sin(a) + dy * Math.cos(a) + C.h / 2, 5);
  });

  it("renders every primitive type to SVG", () => {
    const face: Face = {
      w: 10,
      h: 10,
      prims: [
        { t: "rect", x: 0, y: 0, w: 10, h: 10, r: 1, fill: "#000" },
        { t: "circle", cx: 5, cy: 5, r: 2, stroke: "#fff", dash: [1, 2] },
        { t: "line", x1: 0, y1: 0, x2: 10, y2: 10, stroke: "#fff", o: 0.5 },
        { t: "path", d: "M0 0L1 1", stroke: "#fff", cap: "round" },
        { t: "text", x: 1, y: 9, text: "Hi", font: "mono", size: 4, fill: "#fff", anchor: "middle", ls: 0.1 },
        { t: "image", href: "https://cdn.sanity.io/x.svg", x: 0, y: 0, w: 10, h: 10 },
        { t: "glow", x: 0, y: 0, w: 10, h: 10, cx: 5, cy: 5, rx: 5, ry: 2.5, stops: [[0, "#fff"], [1, "#000"]] },
        { t: "group", tx: 1, rot: 5, s: 2, clip: { cx: 5, cy: 5, r: 4 }, prims: [{ t: "circle", cx: 0, cy: 0, r: 1, fill: "#fff" }] },
      ],
    };
    const svg = faceToSvg(face, "t");
    for (const tag of ["<rect", "<circle", "<line", "<path", "<text", "<image", "<radialGradient", "<clipPath", "<g"]) {
      expect(svg).toContain(tag);
    }
    expect(svg).toContain('stroke-dasharray="1 2"');
    expect(svg).toContain('text-anchor="middle"');
  });
});
