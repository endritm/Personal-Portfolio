import Link from "next/link";
import type { CSSProperties } from "react";
import type { TableObjectId } from "@/lib/content/types";
import { sections } from "@/lib/site";
import { REEL, reelCentres, sheetStack, type TableContent, type TableFaces } from "@/lib/table/faces";
import { placements } from "@/lib/table/layout";
import { FaceSvg } from "./FaceSvg";
import { PhoneCounter } from "./PhoneCounter";
import s from "./phone.module.css";
import { objectOrder } from "./TableFlat";

function Art({ id, faces }: { id: TableObjectId; faces: TableFaces }) {
  const p = placements[id];
  const style = { ["--ar" as string]: `${p.w / p.h}` } as CSSProperties;
  if (id === "sheets") {
    return (
      <span className={s.art} style={style}>
        <span className={s.layer}>
          <FaceSvg face={faces.sheets.mark} id="m-mark" />
        </span>
        <span
          className={`${s.layer} ${s.sketch}`}
          style={{
            ["--dx" as string]: `${(sheetStack.sketch.dx / p.w) * 100}%`,
            ["--dy" as string]: `${(sheetStack.sketch.dy / p.h) * 100}%`,
            ["--lr" as string]: `${sheetStack.sketch.rot}deg`,
          }}
        >
          <FaceSvg face={faces.sheets.sketch} id="m-sketch" />
        </span>
      </span>
    );
  }
  if (id === "tape") {
    return (
      <span className={s.art} style={style}>
        <span className={s.layer}>
          <FaceSvg face={faces.tape} id="m-tape" />
        </span>
        {reelCentres.map((c, i) => (
          <span
            key={i}
            className={s.reel}
            style={{
              left: `${((c.x - REEL / 2) / p.w) * 100}%`,
              top: `${((c.y - REEL / 2) / p.h) * 100}%`,
              width: `${(REEL / p.w) * 100}%`,
              height: `${(REEL / p.h) * 100}%`,
            }}
          >
            <FaceSvg face={faces.reel} id={`m-reel-${i}`} />
          </span>
        ))}
      </span>
    );
  }
  const face = { contact: faces.contact, loupe: faces.loupe, slides: faces.slides, film: faces.film }[id];
  return (
    <span className={s.art} style={style}>
      <span className={s.layer}>
        <FaceSvg face={face} id={`m-${id}`} />
      </span>
    </span>
  );
}

/** On a phone the screen is backlit glass already, so the phone becomes the light table. */
export function PhoneTable({ content, faces }: { content: TableContent; faces: TableFaces }) {
  return (
    <section className={s.phone} aria-label="The light table">
      <ul className={s.track}>
        {objectOrder.map((id, i) => {
          const slot = content.slots[id];
          return (
            <li key={id} className={s.card} data-card={i}>
              <Link href={sections[slot.section].href} className={s.link}>
                <span className={s.stage}>
                  <Art id={id} faces={faces} />
                </span>
                <span className={s.meta}>
                  <span className={s.tape}>
                    <FaceSvg face={faces.labels[id]} id={`m-label-${id}`} />
                    <span className="visually-hidden">{slot.label}</span>
                  </span>
                  {slot.note && <span className={s.note}>{slot.note}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <PhoneCounter count={objectOrder.length} />
    </section>
  );
}
