import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/blocks/Blocks";
import { Img } from "@/components/media/Img";
import { MuxVideo } from "@/components/media/MuxVideo";
import { experimentLabels } from "@/components/work/ExperimentCard";
import { getExperiment, getExperimentSlugs } from "@/lib/content";
import s from "../../work/[slug]/case.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getExperimentSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const experiment = await getExperiment((await params).slug);
  if (!experiment) return {};
  return { title: experiment.title, description: experiment.question };
}

export default async function ExperimentPage({ params }: Props) {
  const experiment = await getExperiment((await params).slug);
  if (!experiment) notFound();
  const label = experimentLabels[experiment.label] ?? experimentLabels.personal;
  const facts: [string, string | undefined][] = [
    ["Year", experiment.year ? String(experiment.year) : undefined],
    ["Tags", experiment.tags?.join(", ")],
  ];
  return (
    <article className="from-light">
      <header className={`wrap ${s.skim}`}>
        <p className="eyebrow">{label}</p>
        <h1 className={s.title}>{experiment.title}</h1>
        <div className={s.skimGrid}>
          {experiment.question && (
            <p className={s.connection}>
              <span className={s.connectionLabel}>The question</span>
              {experiment.question}
            </p>
          )}
          <dl className={s.facts}>
            {facts
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      </header>
      {(experiment.coverVideo?.playbackId || experiment.cover) && (
        <div className={s.hero}>
          {experiment.coverVideo?.playbackId ? (
            <MuxVideo video={experiment.coverVideo} title={experiment.title} />
          ) : (
            experiment.cover && <Img image={experiment.cover} priority sizes="100vw" className={s.heroImage} />
          )}
        </div>
      )}
      <div className={s.story}>
        <Blocks blocks={experiment.blocks} />
      </div>
      <nav className={`wrap ${s.next}`} aria-label="More experiments">
        <Link href="/experiments" className={s.nextLink}>
          <span className="eyebrow">Back to</span>
          <span className={s.nextTitle}>All experiments →</span>
        </Link>
      </nav>
    </article>
  );
}
