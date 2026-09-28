import Link from "next/link";
import { buildFaces } from "@/lib/table/faces";
import { getTableContent } from "@/lib/table/content";
import { Daylight } from "./Daylight";
import { PhoneTable } from "./PhoneTable";
import { TableFlat } from "./TableFlat";
import { TableStage } from "./TableStage";
import s from "./room.module.css";

/** The homepage: a dark room lit by a light table. */
export async function LightTable() {
  const content = await getTableContent();
  const faces = buildFaces(content);
  return (
    <section className={s.room} aria-labelledby="room-title">
      <h1 id="room-title" className="visually-hidden">
        Endrit, brand and motion designer
      </h1>
      <div className={s.desk}>
        <TableStage content={content}>
          <TableFlat content={content} faces={faces} />
        </TableStage>
      </div>
      <Daylight />
      <div className={s.phone}>
        <PhoneTable content={content} faces={faces} />
      </div>
      <p className={s.hint}>
        <span>Everything on the table opens.</span> <Link href="/work">Skip to all work →</Link>
      </p>
    </section>
  );
}
