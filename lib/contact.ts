export type ContactMessage = { name: string; email: string; company?: string; message: string };

export type ContactResult =
  | { ok: true; value: ContactMessage; spam: boolean }
  | { ok: false; field: keyof ContactMessage | "form"; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Shared by the form and the API route, so both give the same answer. */
export function validateContact(input: unknown): ContactResult {
  if (!input || typeof input !== "object") return { ok: false, field: "form", error: "Something went wrong. Try again." };
  const data = input as Record<string, unknown>;
  const name = str(data.name);
  const email = str(data.email);
  const company = str(data.company);
  const message = str(data.message);
  // A field people never see. Bots fill it in.
  const spam = str(data.website).length > 0;

  if (!name) return { ok: false, field: "name", error: "Add your name." };
  if (name.length > 120) return { ok: false, field: "name", error: "That name is too long." };
  if (!EMAIL.test(email)) return { ok: false, field: "email", error: "Add an email address I can reply to." };
  if (message.length < 10) return { ok: false, field: "message", error: "Tell me a little about the project." };
  if (message.length > 5000) return { ok: false, field: "message", error: "Keep it under 5,000 characters." };

  return { ok: true, value: { name, email, company: company || undefined, message }, spam };
}
