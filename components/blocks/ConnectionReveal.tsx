"use client";

import { useEffect, useRef, useState } from "react";
import type { ConnectionLine as Line, ImageRef } from "@/lib/content";
import { Img } from "@/components/media/Img";
import s from "./blocks.module.css";

function useInView<T extends Element>(threshold = 0.5) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** The mark, then the hidden line drawn through it in non-photo blue. */
export function ConnectionLine({ mark, line }: { mark: ImageRef; line?: Line }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.6);
  const ratio = mark.width && mark.height ? `${mark.width} / ${mark.height}` : "16 / 9";
  return (
    <div ref={ref} className={s.lineBox} style={{ aspectRatio: ratio }} data-drawn={inView}>
      <Img image={mark} sizes="(min-width: 900px) 720px, 90vw" className={s.lineMark} />
      {line && (
        <svg className={s.lineSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            className={s.linePath}
          />
        </svg>
      )}
    </div>
  );
}

/** First read, then the second. The reader chooses when. */
export function OverlayReveal({ first, second }: { first: ImageRef; second: ImageRef }) {
  const [shown, setShown] = useState(false);
  return (
    <div className={s.overlay}>
      <div className={s.overlayStack} data-second={shown}>
        <Img image={first} sizes="(min-width: 900px) 720px, 90vw" className={s.overlayFirst} />
        <Img image={second} sizes="(min-width: 900px) 720px, 90vw" className={s.overlaySecond} />
      </div>
      <button type="button" className={s.overlayButton} aria-pressed={shown} onClick={() => setShown((v) => !v)}>
        {shown ? "First read" : "Second read"}
      </button>
    </div>
  );
}
