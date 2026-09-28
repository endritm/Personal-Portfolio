import type { Settings } from "@/lib/content";
import s from "./site.module.css";

export function Availability({ availability, className }: { availability: Settings["availability"]; className?: string }) {
  return (
    <span className={`${s.availabilityLine} ${className ?? ""}`}>
      <span className={s.dot} data-open={availability.open} aria-hidden="true" />
      {availability.line}
    </span>
  );
}
