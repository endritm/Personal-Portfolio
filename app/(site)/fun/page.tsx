import type { Metadata } from "next";
import { Img } from "@/components/media/Img";
import { Empty, PageHeader } from "@/components/site/PageHeader";
import { getFunPage, getLightTable } from "@/lib/content";
import s from "./fun.module.css";

export const metadata: Metadata = {
  title: "Fun",
  description: "Designing for fun, and what's playing while I do.",
};

export default async function FunPage() {
  const [page, table] = await Promise.all([getFunPage(), getLightTable()]);
  const tracks = page.items.filter((i) => i._type === "funTrack");
  const made = page.items.filter((i) => i._type !== "funTrack");
  // The J-card on the table's mixtape doubles as a playlist until tracks are added here.
  const jcard = tracks.length === 0 ? table.tracks : [];

  return (
    <div className="from-light">
      <PageHeader eyebrow="Personal" title="Fun" intro={page.intro} />
      {page.items.length === 0 && jcard.length === 0 && <Empty>Nothing on the tape yet.</Empty>}

      {(tracks.length > 0 || jcard.length > 0) && (
        <section className={`wrap ${s.tape}`} aria-labelledby="playing">
          <div className={s.jcard}>
            <p id="playing" className={s.side}>
              Side A
            </p>
            <ol className={s.tracks}>
              {tracks.map((t) =>
                t._type === "funTrack" ? (
                  <li key={t._key}>
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener">
                        {t.title}
                      </a>
                    ) : (
                      t.title
                    )}
                    {t.artist && <span className={s.artist}> · {t.artist}</span>}
                    {t.note && <span className={s.trackNote}>{t.note}</span>}
                  </li>
                ) : null,
              )}
              {jcard.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {made.length > 0 && (
        <ul className={`wrap ${s.board}`}>
          {made.map((item) => {
            if (item._type === "funImage" && item.image) {
              return (
                <li key={item._key} className={s.pinned}>
                  <Img image={item.image} sizes="(min-width: 900px) 33vw, 100vw" className={s.image} />
                  {item.caption && <p className={s.caption}>{item.caption}</p>}
                </li>
              );
            }
            if (item._type === "funNote") {
              return (
                <li key={item._key} className={s.note}>
                  {item.text}
                </li>
              );
            }
            return null;
          })}
        </ul>
      )}
    </div>
  );
}
