import Link from "next/link";
import { getSettings } from "@/lib/content";
import { Availability } from "./Availability";
import { CopyEmail } from "./CopyEmail";
import s from "./cta.module.css";

/** Ends every case study: the way to start the next one. */
export async function ContactCta() {
  const settings = await getSettings();
  return (
    <section className={`wrap ${s.cta}`} aria-labelledby="cta-title">
      <p className="eyebrow">Next</p>
      <h2 id="cta-title" className={s.line}>
        Somewhere in your company there&rsquo;s a connection nobody has noticed.
      </h2>
      <div className={s.actions}>
        <CopyEmail email={settings.email} />
        <Link href="/contact" className={s.button}>
          Start a project
        </Link>
        <Availability availability={settings.availability} />
      </div>
    </section>
  );
}
