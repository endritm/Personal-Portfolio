import Link from "next/link";
import { getSettings } from "@/lib/content";
import { Availability } from "./Availability";
import { CopyEmail } from "./CopyEmail";
import { GjilanClock } from "./GjilanClock";
import s from "./site.module.css";

export async function SiteFooter() {
  const settings = await getSettings();
  return (
    <footer className={s.footer}>
      <div className={`wrap ${s.footerGrid}`}>
        <div className={s.footerCol}>
          <p className="eyebrow">Email</p>
          <CopyEmail email={settings.email} />
        </div>
        <div className={s.footerCol}>
          <p className="eyebrow">Availability</p>
          <Availability availability={settings.availability} />
        </div>
        <div className={s.footerCol}>
          <p className="eyebrow">Local time</p>
          <GjilanClock />
        </div>
        {settings.socials.length > 0 && (
          <div className={s.footerCol}>
            <p className="eyebrow">Elsewhere</p>
            <ul className={s.socials}>
              {settings.socials.map((link) => (
                <li key={link.url}>
                  <a href={link.url} rel="me noopener" target="_blank">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className={`wrap ${s.fine}`}>
        <span>© {new Date().getFullYear()} Endrit</span>
        <Link href="/contact">Start a project</Link>
      </div>
    </footer>
  );
}
