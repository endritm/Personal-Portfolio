import type { Metadata } from "next";
import { Empty, PageHeader } from "@/components/site/PageHeader";
import { ArchiveList } from "@/components/work/ArchiveList";
import { WorkRows } from "@/components/work/WorkRows";
import { getSettings, getWorkIndex } from "@/lib/content";
import s from "@/components/site/page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description: "Brand identity case studies, and the idea inside each one.",
};

export default async function WorkPage() {
  const [{ featured, archive }, settings] = await Promise.all([getWorkIndex(), getSettings()]);
  return (
    <div className="from-light">
      <PageHeader eyebrow="Brand identity" title="Work" intro={settings.workIntro} />
      {featured.length === 0 && archive.length === 0 && <Empty>Case studies are on their way.</Empty>}
      {featured.length > 0 && (
        <section className={`wrap ${s.section}`} aria-labelledby="selected">
          <div className={s.sectionHead}>
            <h2 id="selected" className="eyebrow">
              Selected work
            </h2>
          </div>
          <WorkRows studies={featured} headingLevel={3} />
        </section>
      )}
      {archive.length > 0 && (
        <section className={`wrap ${s.section}`} aria-labelledby="all">
          <div className={s.sectionHead}>
            <h2 id="all" className="eyebrow">
              All work
            </h2>
          </div>
          <ArchiveList studies={archive} />
        </section>
      )}
    </div>
  );
}
