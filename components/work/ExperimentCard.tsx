import Link from "next/link";
import type { ExperimentLabel, ExperimentSummary } from "@/lib/content";
import { Img, muxPreview } from "@/components/media/Img";
import s from "./experiments.module.css";

export const experimentLabels: Record<ExperimentLabel, string> = {
  personal: "Personal experiment",
  "self-initiated": "Self-initiated",
};

export function ExperimentCard({ experiment }: { experiment: ExperimentSummary }) {
  return (
    <Link href={`/experiments/${experiment.slug}`} className={s.card}>
      <span className={s.frame}>
        {experiment.coverVideo?.playbackId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={muxPreview(experiment.coverVideo.playbackId)} alt="" loading="lazy" decoding="async" />
        ) : experiment.cover ? (
          <Img image={{ ...experiment.cover, alt: "" }} sizes="(min-width: 900px) 33vw, 100vw" />
        ) : null}
      </span>
      <span className={s.label}>{experimentLabels[experiment.label] ?? experimentLabels.personal}</span>
      <span className={s.title}>{experiment.title}</span>
      {experiment.question && <span className={s.question}>{experiment.question}</span>}
    </Link>
  );
}
