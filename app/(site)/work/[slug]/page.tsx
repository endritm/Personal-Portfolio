import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/blocks/Blocks";
import { Img } from "@/components/media/Img";
import { MuxVideo } from "@/components/media/MuxVideo";
import { ContactCta } from "@/components/site/ContactCta";
import { getCaseStudy, getCaseStudySlugs, getNextCaseStudy, getWorkIndex } from "@/lib/content";
import s from "./case.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCaseStudySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const study = await getCaseStudy((await params).slug);
  if (!study) return {};
  const image = study.seo?.image ?? study.cover;
  return {
    title: study.seo?.title ?? study.title,
    description: study.seo?.description ?? study.connection,
    openGraph: image ? { images: [{ url: image.url, width: image.width, height: image.height }] } : undefined,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();
  const [next, { featured }] = await Promise.all([getNextCaseStudy(slug), getWorkIndex()]);
  const position = featured.findIndex((f) => f.slug === slug);

  const facts: [string, string | undefined][] = [
    ["Client", study.client],
    ["Sector", study.sector],
    ["Year", study.year ? String(study.year) : undefined],
    ["Role", study.role],
    ["Deliverables", study.deliverables?.join(", ")],
    ["Studio", study.credits?.studio],
  ];

  return (
    <article className="from-light" style={study.accent ? { ["--accent" as string]: study.accent } : undefined}>
      <header className={`wrap ${s.skim}`}>
        <p className="eyebrow">{position >= 0 ? `Selected work · ${String(position + 1).padStart(2, "0")}` : "Case study"}</p>
        <h1 className={s.title}>{study.title}</h1>
        <div className={s.skimGrid}>
          <p className={s.connection}>
            <span className={s.connectionLabel}>The Connection</span>
            {study.connection}
          </p>
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
        {study.mood && <p className={s.mood}>{study.mood}</p>}
      </header>

      {(study.coverVideo?.playbackId || study.cover) && (
        <div className={s.hero}>
          {study.coverVideo?.playbackId ? (
            <MuxVideo video={study.coverVideo} title={study.title} />
          ) : (
            study.cover && <Img image={study.cover} priority sizes="100vw" className={s.heroImage} />
          )}
        </div>
      )}

      <div className={s.story}>
        <Blocks blocks={study.blocks} />
      </div>

      {study.credits?.collaborators?.length ? (
        <p className={`wrap ${s.credits}`}>With {study.credits.collaborators.join(", ")}.</p>
      ) : null}

      <ContactCta />

      {next && (
        <nav className={`wrap ${s.next}`} aria-label="Next case study">
          <Link href={`/work/${next.slug}`} className={s.nextLink}>
            <span className="eyebrow">Next case study</span>
            <span className={s.nextTitle}>{next.title} →</span>
            <span className={s.nextConnection}>{next.connection}</span>
          </Link>
        </nav>
      )}
    </article>
  );
}
