import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import s from "@/components/site/page.module.css";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={`wrap ${s.header}`}>
        <p className="eyebrow">404</p>
        <h1 className={s.title}>Nothing on this sheet.</h1>
        <p className={s.intro}>The page moved, or never existed.</p>
        <p>
          <Link href="/work">All work →</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
