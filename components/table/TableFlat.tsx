import Link from "next/link";
import type { CSSProperties } from "react";
import type { TableObjectId } from "@/lib/content/types";
import { sections } from "@/lib/site";
import { REEL, reelCentres, sheetStack, tapeWidth, type TableContent, type TableFaces } from "@/lib/table/faces";
import { FRAME, pencil, percentBox, placements, TABLE_H, TABLE_W, tapeSize } from "@/lib/table/layout";
import { FaceSvg } from "./FaceSvg";
import s from "./table.module.css";

/** Tab order, and the order the phone version shows the objects in. */
export const objectOrder: TableObjectId[] = ["sheets", "contact", "film", "slides", "tape", "loupe"];

const pct = (n: number) => `${n}%`;

function boxStyle(id: TableObjectId): CSSProperties {
  const p = placements[id];
  const b = percentBox(p);
  return {
    left: pct(b.left),
    top: pct(b.top),
    width: pct(b.width),
    height: pct(b.height),
    ["--rot" as string]: `${p.rot}deg`,
  };
}

function Tape({ id, content, faces }: { id: TableObjectId; content: TableContent; faces: TableFaces }) {
  const p = placements[id];
  const w = tapeWidth(content.slots[id].label);
  return (
    <span
      className={s.labelTape}
      data-visual
      style={{
        left: pct((p.tape.x / p.w) * 100),
        top: pct((p.tape.y / p.h) * 100),
        width: pct((w / p.w) * 100),
        height: pct((tapeSize.h / p.h) * 100),
        ["--tape-rot" as string]: `${p.tape.rot}deg`,
      }}
    >
      <FaceSvg face={faces.labels[id]} id={`tape-${id}`} />
    </span>
  );
}

function Layers({ id, faces }: { id: TableObjectId; faces: TableFaces }) {
  const p = placements[id];
  if (id === "sheets") {
    return (["spareA", "spareB", "mark", "sketch"] as const).map((k) => (
      <span
        key={k}
        className={`${s.layer} ${s[`sheet-${k}`]}`}
        data-visual
        style={{
          ["--dx" as string]: pct((sheetStack[k].dx / p.w) * 100),
          ["--dy" as string]: pct((sheetStack[k].dy / p.h) * 100),
          ["--lr" as string]: `${sheetStack[k].rot}deg`,
        }}
      >
        <FaceSvg face={faces.sheets[k]} id={`sheet-${k}`} />
      </span>
    ));
  }
  if (id === "tape") {
    return (
      <>
        <span className={s.layer} data-visual>
          <FaceSvg face={faces.tape} id="cassette" />
        </span>
        {reelCentres.map((c, i) => (
          <span
            key={i}
            className={s.reel}
            data-visual
            style={{
              left: pct(((c.x - REEL / 2) / p.w) * 100),
              top: pct(((c.y - REEL / 2) / p.h) * 100),
              width: pct((REEL / p.w) * 100),
              height: pct((REEL / p.h) * 100),
            }}
          >
            <FaceSvg face={faces.reel} id={`reel-${i}`} />
          </span>
        ))}
      </>
    );
  }
  const face = { contact: faces.contact, loupe: faces.loupe, slides: faces.slides, film: faces.film }[id];
  return (
    <span className={s.layer} data-visual>
      <FaceSvg face={face} id={id} />
    </span>
  );
}

/** The light table, drawn flat. Real links, server-rendered, no JavaScript needed. */
export function TableFlat({ content, faces }: { content: TableContent; faces: TableFaces }) {
  const pencilBox = percentBox(pencil);
  return (
    <div className={s.table}>
      <span className={s.fill} data-visual>
        <FaceSvg face={faces.frame} id="frame" />
      </span>
      <span
        className={s.glass}
        data-visual
        style={{
          left: pct((FRAME / TABLE_W) * 100),
          top: pct((FRAME / TABLE_H) * 100),
          right: pct((FRAME / TABLE_W) * 100),
          bottom: pct((FRAME / TABLE_H) * 100),
        }}
      >
        <FaceSvg face={faces.glass} id="glass" />
      </span>
      <span
        className={s.pencil}
        data-visual
        style={{
          left: pct(pencilBox.left),
          top: pct(pencilBox.top),
          width: pct(pencilBox.width),
          height: pct(pencilBox.height),
          ["--rot" as string]: `${pencil.rot}deg`,
        }}
      >
        <FaceSvg face={faces.pencil} id="pencil" />
      </span>
      <nav aria-label="The light table" className={s.objects}>
        {objectOrder.map((id) => {
          const slot = content.slots[id];
          return (
            <Link key={id} href={sections[slot.section].href} className={`${s.object} ${s[id]}`} data-object={id} style={boxStyle(id)}>
              <span className={s.spot} data-visual />
              <Layers id={id} faces={faces} />
              <Tape id={id} content={content} faces={faces} />
              <span className="visually-hidden">
                {slot.label}
                {slot.note ? `. ${slot.note}` : ""}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
