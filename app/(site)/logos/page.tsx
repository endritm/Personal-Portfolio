import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/media/Img";
import { Empty, PageHeader } from "@/components/site/PageHeader";
import { getLogosPage, type Logo } from "@/lib/content";
import s from "./logos.module.css";

export const metadata: Metadata = {
  title: "Logos",
  description: "A collection of marks.",
};

function Slide({ logo }: { logo: Logo }) {
  const inner = (
    <>
      <span className={s.window} style={logo.background ? { background: logo.background } : undefined}>
        {logo.mark ? (
          <Img image={{ ...logo.mark, alt: logo.mark.alt || logo.name }} sizes="(min-width: 900px) 20vw, 45vw" className={s.mark} />
        ) : (
          <span className={s.initial} aria-hidden="true">
            {logo.name.charAt(0)}
          </span>
        )}
      </span>
      <span className={s.name}>{logo.name}</span>
      <span className={s.meta}>{[logo.year, logo.note].filter(Boolean).join(" · ")}</span>
    </>
  );
  return logo.caseStudySlug ? (
    <Link href={`/work/${logo.caseStudySlug}`} className={s.slide}>
      {inner}
    </Link>
  ) : (
    <div className={s.slide}>{inner}</div>
  );
}

export default async function LogosPage() {
  const page = await getLogosPage();
  return (
    <div className="from-light">
      <PageHeader eyebrow="Collection" title="Logos" intro={page.intro} />
      {page.logos.length === 0 ? (
        <Empty>The collection is being compiled.</Empty>
      ) : (
        <div className="wrap">
          <ul className={s.sheet}>
            {page.logos.map((logo) => (
              <li key={logo._key}>
                <Slide logo={logo} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
