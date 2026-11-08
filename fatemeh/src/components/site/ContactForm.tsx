"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { submitContact } from "@/app/actions/public";
import { CONTACT_TOPICS } from "@/lib/validation";
import { buttonClass } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";

export function ContactForm() {
  const startedAt = useRef(Date.now());
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <div role="status" className="rounded-[1.5rem] border border-line bg-ivory-raised p-8 md:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-charcoal text-ivory">
          <Check className="size-5" />
        </span>
        <p className="mt-6 font-display text-3xl">Thank you, your message is with us.</p>
        <p className="mt-3 text-stone">
          Your reference is <strong className="tracking-wider text-charcoal">{done}</strong>. We&apos;ll reply as soon as we can.
        </p>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    start(async () => {
      const res = await submitContact({
        name: String(f.get("name") ?? ""),
        email: String(f.get("email") ?? ""),
        phone: String(f.get("phone") ?? ""),
        topic: String(f.get("topic") ?? "") as (typeof CONTACT_TOPICS)[number],
        message: String(f.get("message") ?? ""),
        privacyAcknowledged: (f.get("privacy") === "on") as true,
        website: String(f.get("website") ?? ""),
        startedAt: startedAt.current,
      });
      if (res.ok) setDone(res.reference);
      else {
        setErrors(res.fields ?? {});
        setFormError(res.error);
      }
    });
  };

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-error`} className="field-error">
        {errors[k]}
      </p>
    ) : null;
  const a11y = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="field-label">
            Name
          </label>
          <input id="c-name" name="name" autoComplete="name" className="field" {...a11y("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="c-email" className="field-label">
            Email
          </label>
          <input id="c-email" name="email" type="email" autoComplete="email" className="field" {...a11y("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="c-phone" className="field-label">
            Phone <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="c-phone" name="phone" type="tel" autoComplete="tel" className="field" {...a11y("phone")} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="c-topic" className="field-label">
            Topic
          </label>
          <select id="c-topic" name="topic" className="field" defaultValue={CONTACT_TOPICS[0]}>
            {CONTACT_TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="field-label">
          Message
        </label>
        <textarea id="c-message" name="message" rows={5} className="field resize-y" {...a11y("message")} />
        <p className="mt-1.5 text-xs text-muted">Please don&apos;t include medical details or photos here. Use the private assessment instead.</p>
        {err("message")}
      </div>
      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm text-stone">
        <input name="privacy" type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--color-charcoal)]" {...a11y("privacyAcknowledged")} />
        <span>
          I&apos;ve read the{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-bronze">
            privacy notice
          </Link>{" "}
          and understand how my message will be used.
        </span>
      </label>
      {errors.privacyAcknowledged && <p className="field-error -mt-3">{errors.privacyAcknowledged}</p>}
      {formError && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {formError}
        </p>
      )}
      <div>
        <button type="submit" disabled={pending} className={buttonClass("primary", "w-full py-4 sm:w-auto")}>
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
