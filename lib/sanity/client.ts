import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

/** Every published query carries this tag, so one webhook call refreshes the site. */
export const CONTENT_TAG = "content";

// No API CDN: Next's data cache does the caching, and the webhook needs fresh reads right after a publish.
const client = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" })
  : null;

export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  if (!client) throw new Error("Sanity is not configured");
  return client.fetch<T>(query, params, {
    cache: "force-cache",
    next: { tags: [CONTENT_TAG] },
  });
}
