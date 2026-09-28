"use client";

import { useRef, useState } from "react";
import s from "./site.module.css";

/** The address is always visible and selectable. The button is a shortcut. */
export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const text = useRef<HTMLAnchorElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const node = text.current;
      if (node) window.getSelection()?.selectAllChildren(node);
    }
  }

  return (
    <span className={`${s.copy} ${className ?? ""}`}>
      <a ref={text} href={`mailto:${email}`} className={s.email}>
        {email}
      </a>
      <button type="button" onClick={copy} className={s.copyButton}>
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Email address copied" : ""}
      </span>
    </span>
  );
}
