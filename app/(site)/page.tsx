import Link from "next/link";
import { LightTable } from "@/components/table/LightTable";
import { WorkRows } from "@/components/work/WorkRows";
import { getWorkIndex } from "@/lib/content";
import s from "@/components/site/page.module.css";

export default async function Home() {
  const { featured, archive } = await getWorkIndex();
  const total = featured.length + archive.length;
  return (
    <>
      <LightTable />
      <section className={`wrap ${s.section}`} aria-labelledby="selected-title">
        <div className={s.sectionHead}>
          <p id="selected-title" className="eyebrow">
            Selected work
          </p>
          <Link href="/work">All work ({total}) →</Link>
        </div>
        <WorkRows studies={featured} headingLevel={3} />
      </section>
    </>
  );
}
