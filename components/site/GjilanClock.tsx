"use client";

import { useSyncExternalStore } from "react";
import { gjilanTime } from "@/lib/time";

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}

export function GjilanClock() {
  const label = useSyncExternalStore(subscribe, () => gjilanTime().label, () => "--:--");
  return (
    <span>
      Gjilan, <time>{label}</time>
    </span>
  );
}
