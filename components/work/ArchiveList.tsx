"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CaseStudySummary } from "@/lib/content";
import s from "./work.module.css";

/** All work: a fast list, filterable by sector. Without JavaScript it simply shows everything. */
export function ArchiveList({ studies }: { studies: CaseStudySummary[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const sectors = useMemo(
    () => [...new Set(studies.map((st) => st.sector).filter((x): x is string => Boolean(x)))].sort(),
    [studies],
  );
  const shown = filter ? studies.filter((st) => st.sector === filter) : studies;

  return (
    <div className={s.archive}>
      {sectors.length > 1 && (
        <div className={s.filters} role="group" aria-label="Filter by sector">
          <button type="button" className={s.chip} aria-pressed={filter === null} onClick={() => setFilter(null)}>
            All <span className={s.count}>{studies.length}</span>
          </button>
          {sectors.map((sector) => (
            <button
              key={sector}
              type="button"
              className={s.chip}
              aria-pressed={filter === sector}
              onClick={() => setFilter((f) => (f === sector ? null : sector))}
            >
              {sector}
            </button>
          ))}
        </div>
      )}
      <ul className={s.list}>
        {shown.map((study) => (
          <li key={study._id}>
            <Link href={`/work/${study.slug}`} className={s.item}>
              <span className={s.itemTitle}>{study.title}</span>
              <span className={s.itemConnection}>{study.connection}</span>
              <span className={s.itemMeta}>
                {study.sector}
                {study.year ? ` · ${study.year}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
