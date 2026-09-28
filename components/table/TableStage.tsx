"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState, useSyncExternalStore, type FocusEvent } from "react";
import type { TableObjectId } from "@/lib/content/types";
import { sections } from "@/lib/site";
import type { TableContent } from "@/lib/table/faces";
import s from "./table.module.css";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const QUERIES = ["(min-width: 900px) and (hover: hover) and (pointer: fine)", "(prefers-reduced-motion: reduce)"];

let webgl: boolean | undefined;
function hasWebGL2() {
  if (webgl === undefined) {
    try {
      webgl = Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

/** 3D only where it helps: big screen, a mouse, motion allowed, no data saver, WebGL 2. */
function canRun3D() {
  const [desktop, reduced] = QUERIES.map((q) => window.matchMedia(q).matches);
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return desktop && !reduced && !saveData && hasWebGL2();
}

function subscribe(onChange: () => void) {
  const lists = QUERIES.map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

/**
 * Holds the flat table and, where the device can take it, loads the 3D table over it.
 * The flat table's links stay in the page either way.
 */
export function TableStage({ content, children }: { content: TableContent; children: React.ReactNode }) {
  const router = useRouter();
  const capable = useSyncExternalStore(subscribe, canRun3D, () => false);
  const [lost, setLost] = useState(false);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  const [hovering, setHovering] = useState<TableObjectId | null>(null);
  const [focused, setFocused] = useState<TableObjectId | null>(null);

  const use3D = capable && !lost;
  const hrefFor = useCallback((id: TableObjectId) => sections[content.slots[id].section].href, [content]);

  const onReady = useCallback(() => setReady(true), []);
  const onLost = useCallback(() => {
    setLost(true);
    setShown(false);
  }, []);
  const onHoverChange = useCallback(
    (id: TableObjectId | null) => {
      setHovering(id);
      if (id) router.prefetch(hrefFor(id));
    },
    [router, hrefFor],
  );
  const onOpen = useCallback(
    (id: TableObjectId, newTab: boolean) => {
      const href = hrefFor(id);
      if (newTab) window.open(href, "_blank", "noopener");
      else router.push(href);
    },
    [router, hrefFor],
  );

  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    const id = (e.target as HTMLElement).closest("[data-object]")?.getAttribute("data-object");
    setFocused((id as TableObjectId | null) ?? null);
  };

  return (
    <div
      className={s.stage}
      data-mode={use3D && shown ? "3d" : "flat"}
      onFocus={onFocus}
      onBlur={() => setFocused(null)}
    >
      {children}
      {use3D && (
        <div
          className={s.canvas}
          data-ready={ready}
          data-hovering={hovering !== null}
          onTransitionEnd={(e) => {
            if (e.propertyName === "opacity" && ready) setShown(true);
          }}
        >
          <Scene
            content={content}
            focused={focused}
            onReady={onReady}
            onLost={onLost}
            onHoverChange={onHoverChange}
            onOpen={onOpen}
          />
        </div>
      )}
    </div>
  );
}
