"use client";

import { useSyncExternalStore } from "react";
import { isDaylightInGjilan } from "@/lib/time";
import s from "./table.module.css";

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}

/** The room follows Gjilan's clock: window light by day, only the table at night. */
export function Daylight() {
  const on = useSyncExternalStore(subscribe, () => isDaylightInGjilan(), () => false);
  return <span className={s.daylight} data-on={on} aria-hidden="true" />;
}
