import { NextStudio } from "next-sanity/studio";
import { isSanityConfigured } from "@/lib/sanity/env";
import config from "../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main style={{ padding: "48px var(--gutter)", maxWidth: "62ch", display: "grid", gap: 16 }}>
        <p className="eyebrow">Studio</p>
        <h1 style={{ fontSize: "var(--step-4)", lineHeight: 1 }}>Connect a Sanity project</h1>
        <p style={{ color: "var(--ink-2)" }}>
          The site is running on seed content. Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and optionally{" "}
          <code>NEXT_PUBLIC_SANITY_DATASET</code>) in your environment, redeploy, and the Studio appears here.
          The README has the full setup.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
