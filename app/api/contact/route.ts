import { validateContact } from "@/lib/contact";

/**
 * Sends the contact form through Resend when RESEND_API_KEY and CONTACT_TO_EMAIL are set.
 * Until then it says so, and the form points people to the email address.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = validateContact(body);
  if (!result.ok) return Response.json({ error: result.error, field: result.field }, { status: 400 });
  if (result.spam) return Response.json({ ok: true });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    return Response.json({ error: "not-configured" }, { status: 503 });
  }

  const { name, email, company, message } = result.value;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `Project enquiry from ${name}${company ? `, ${company}` : ""}`,
      text: `${message}\n\n${name}${company ? ` (${company})` : ""}\n${email}`,
    }),
  });

  if (!response.ok) return Response.json({ error: "send-failed" }, { status: 502 });
  return Response.json({ ok: true });
}
