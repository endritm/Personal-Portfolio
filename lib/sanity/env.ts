export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-09-01";

/** Without a project ID the site runs on seed content and /studio explains how to connect. */
export const isSanityConfigured = /^[a-z0-9-]+$/.test(projectId);
