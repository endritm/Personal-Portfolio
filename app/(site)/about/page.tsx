import type { Metadata } from "next";
import Link from "next/link";
import { RichText } from "@/components/blocks/Blocks";
import { getAbout } from "@/lib/content";
import s from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Why I look twice.",
};

export default async function AboutPage() {
  const about = await getAbout();
  return (
    <article className={`wrap from-light ${s.about}`}>
      <p className="eyebrow">About</p>
      <h1 className={s.headline}>{about.headline}</h1>
      <div className={s.body}>
        <RichText value={about.body} />
        {about.location && <p className={s.location}>{about.location}</p>}
        <p className={s.links}>
          <Link href="/work">See the work →</Link>
          <Link href="/contact">Get in touch →</Link>
        </p>
      </div>
    </article>
  );
}
