"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections, type SectionKey } from "@/lib/site";

const navKeys: SectionKey[] = ["work", "experiments", "motion", "logos", "fun", "about"];

type Props = { className?: string; linkClassName?: string; withContact?: boolean };

export function NavLinks({ className, linkClassName, withContact = false }: Props) {
  const pathname = usePathname();
  const keys: SectionKey[] = withContact ? [...navKeys, "contact"] : navKeys;
  return (
    <ul className={className}>
      {keys.map((key) => {
        const { href, title } = sections[key];
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={key}>
            <Link
              href={href}
              className={linkClassName}
              aria-current={current ? "page" : undefined}
              // Inside the phone menu, close it once a link is chosen.
              onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}
            >
              {title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
