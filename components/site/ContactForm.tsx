"use client";

import { useState, type FormEvent } from "react";
import { validateContact, type ContactMessage } from "@/lib/contact";
import s from "./contact.module.css";

type State =
  | { status: "idle" | "sending" | "sent" }
  | { status: "error"; field: keyof ContactMessage | "form"; message: string };

export function ContactForm({ email }: { email: string }) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const checked = validateContact(data);
    if (!checked.ok) return setState({ status: "error", field: checked.field, message: checked.error });

    setState({ status: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) return setState({ status: "sent" });
      const body = (await res.json().catch(() => ({}))) as { error?: string; field?: keyof ContactMessage };
      const message =
        body.error === "not-configured" || body.error === "send-failed"
          ? `The form isn't sending right now. Email me directly at ${email}.`
          : (body.error ?? "Something went wrong. Try again.");
      setState({ status: "error", field: body.field ?? "form", message });
    } catch {
      setState({ status: "error", field: "form", message: `Couldn't reach the server. Email me directly at ${email}.` });
    }
  }

  if (state.status === "sent") {
    return (
      <p className={s.sent} role="status">
        Thanks. Your message is on its way to me.
      </p>
    );
  }

  const error = state.status === "error" ? state : null;
  const invalid = (field: keyof ContactMessage) => (error?.field === field ? true : undefined);

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <div className={s.row}>
        <label className={s.field}>
          <span>Name</span>
          <input name="name" id="contact-name" autoComplete="name" required aria-invalid={invalid("name")} />
        </label>
        <label className={s.field}>
          <span>Email</span>
          <input name="email" id="contact-email" type="email" autoComplete="email" required aria-invalid={invalid("email")} />
        </label>
      </div>
      <label className={s.field}>
        <span>
          Company <em>optional</em>
        </span>
        <input name="company" id="contact-company" autoComplete="organization" />
      </label>
      <label className={s.field}>
        <span>What does the company do?</span>
        <textarea name="message" id="contact-message" rows={6} required aria-invalid={invalid("message")} />
      </label>
      <label className={s.trap} aria-hidden="true">
        Website
        <input name="website" id="contact-website" tabIndex={-1} autoComplete="off" />
      </label>
      {error && (
        <p className={s.error} role="alert">
          {error.message}
        </p>
      )}
      <button type="submit" className={s.submit} disabled={state.status === "sending"}>
        {state.status === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
