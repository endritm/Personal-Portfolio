"use client";

import { useEffect, useRef, useState } from "react";
import s from "./phone.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** "02 / 06" under the swipeable table. */
export function PhoneCounter({ count }: { count: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const track = ref.current?.previousElementSibling;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setIndex(Number((entry.target as HTMLElement).dataset.card ?? 0));
        }
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll("[data-card]").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} className={s.counter} aria-hidden="true">
      {pad(index + 1)} / {pad(count)}
    </p>
  );
}
