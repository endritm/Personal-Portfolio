import Link from "next/link";
import { getSettings } from "@/lib/content";
import { Availability } from "./Availability";
import { NavLinks } from "./NavLinks";
import s from "./site.module.css";

export async function SiteHeader() {
  const settings = await getSettings();
  return (
    <header className={s.header}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className={`wrap ${s.bar}`}>
        <Link href="/" className={s.home}>
          {settings.wordmark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.wordmark.url} alt="Endrit" className={s.wordmark} />
          ) : (
            "Endrit"
          )}
        </Link>
        <Link href="/work" className={s.allWork}>
          All work <span aria-hidden="true">→</span>
        </Link>
        <nav aria-label="Sections" className={s.nav}>
          <NavLinks className={s.navList} linkClassName={s.navLink} />
        </nav>
        <Availability availability={settings.availability} className={s.availability} />
        <Link href="/contact" className={s.contact}>
          Contact
        </Link>
        <details className={s.menu}>
          <summary className={s.menuButton}>Menu</summary>
          <nav aria-label="Sections" className={s.menuPanel}>
            <NavLinks className={s.menuList} linkClassName={s.menuLink} withContact />
            <Availability availability={settings.availability} />
          </nav>
        </details>
      </div>
    </header>
  );
}
