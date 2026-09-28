import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import type { NextRequest } from "next/server";
import { CONTENT_TAG } from "@/lib/sanity/client";

/**
 * Sanity webhook: publish in Studio, the site refreshes.
 * Point a GROQ-powered webhook at /api/revalidate with the SANITY_REVALIDATE_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
  if (!isValidSignature) return Response.json({ error: "Invalid signature" }, { status: 401 });

  // The next visit gets fresh content, not a stale copy.
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ revalidated: true, type: body?._type ?? null });
}
