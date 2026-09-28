import Link from "next/link";
import type { CaseStudySummary } from "@/lib/content";
import { Img, muxPreview } from "@/components/media/Img";
import s from "./work.module.css";

function Preview({ study }: { study: CaseStudySummary }) {
  if (study.coverVideo?.playbackId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={s.preview} src={muxPreview(study.coverVideo.playbackId, 480)} alt="" loading="lazy" decoding="async" />
    );
  }
  if (study.cover) return <Img image={{ ...study.cover, alt: "" }} sizes="240px" className={s.preview} />;
  return null;
}

/** Selected work, numbered in the order set in Studio. */
export function WorkRows({ studies, headingLevel = 2 }: { studies: CaseStudySummary[]; headingLevel?: 2 | 3 }) {
  const Title = headingLevel === 2 ? "h2" : "h3";
  return (
    <ol className={s.rows}>
      {studies.map((study, i) => (
        <li key={study._id}>
          <Link href={`/work/${study.slug}`} className={s.row} style={study.accent ? { ["--accent" as string]: study.accent } : undefined}>
            <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
            <Title className={s.title}>{study.title}</Title>
            <span className={s.connection}>{study.connection}</span>
            <span className={s.sector}>
              {study.mood ?? study.sector}
              {study.year ? ` · ${study.year}` : ""}
            </span>
            <Preview study={study} />
          </Link>
        </li>
      ))}
    </ol>
  );
}
