import type { Metadata } from "next";
import { Empty, PageHeader } from "@/components/site/PageHeader";
import { ExperimentCard } from "@/components/work/ExperimentCard";
import { getExperiments, getSettings } from "@/lib/content";
import s from "@/components/work/experiments.module.css";

export const metadata: Metadata = {
  title: "Experiments",
  description: "Self-initiated experiments: motion studies, generative graphics, code, typography.",
};

export default async function ExperimentsPage() {
  const [experiments, settings] = await Promise.all([getExperiments(), getSettings()]);
  return (
    <div className="from-light">
      <PageHeader eyebrow="Self-initiated" title="Experiments" intro={settings.experimentsIntro} />
      {experiments.length === 0 ? (
        <Empty>The first experiments go up soon.</Empty>
      ) : (
        <ul className={`wrap ${s.grid}`}>
          {experiments.map((e) => (
            <li key={e._id}>
              <ExperimentCard experiment={e} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
