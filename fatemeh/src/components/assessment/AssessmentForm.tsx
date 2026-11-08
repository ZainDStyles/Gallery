"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { startUploadSession, submitAssessment } from "@/app/actions/public";
import { COUNTRIES, PINNED_COUNTRIES } from "@/content/countries";
import { site } from "@/content/site";
import {
  aboutYouSchema,
  AFFECTED_AREAS,
  consentSchema,
  CONTACT_PREFERENCES,
  DATE_FLEXIBILITY,
  FAMILY_HISTORY,
  fieldErrors,
  HAIR_LOSS_ONSET,
  HAIR_LOSS_PROGRESS,
  hairHistorySchema,
  PHOTO_SLOTS,
  timingSchema,
  type PhotoSlotName,
} from "@/lib/validation";
import { buttonClass, ArrowBadge } from "@/components/ui/Button";
import { ArrowRight, Check, Lock } from "@/components/ui/icons";
import { Checkbox, Chips, Field, invalid } from "./fields";
import { PhotoSlot, SLOT_INFO, type SlotState } from "./PhotoSlot";
import { deletePhoto, preparePhoto, uploadPhoto } from "./photo-utils";

const STEPS = ["About you", "Your hair", "Photographs", "Timing & review"] as const;

type Values = {
  fullName: string;
  age: string;
  email: string;
  phone: string;
  phoneIsWhatsApp: boolean;
  country: string;
  contactPreference: "EMAIL" | "WHATSAPP" | "PHONE";
  hairLossOnset: string;
  hairLossProgress: string;
  affectedAreas: string[];
  familyHistory: string;
  historyNotes: string;
  previousTransplant: boolean | null;
  previousDetails: string;
  preferredDate: string;
  dateFlexibility: string;
  healthConsent: boolean;
  privacyAcknowledged: boolean;
  marketingConsent: boolean;
};

const INITIAL: Values = {
  fullName: "",
  age: "",
  email: "",
  phone: "",
  phoneIsWhatsApp: true,
  country: "",
  contactPreference: "EMAIL",
  hairLossOnset: "",
  hairLossProgress: "",
  affectedAreas: [],
  familyHistory: "",
  historyNotes: "",
  previousTransplant: null,
  previousDetails: "",
  preferredDate: "",
  dateFlexibility: "around",
  healthConsent: false,
  privacyAcknowledged: false,
  marketingConsent: false,
};

const STEP_OF_FIELD: Record<string, number> = {
  fullName: 0, age: 0, email: 0, phone: 0, phoneIsWhatsApp: 0, country: 0, contactPreference: 0,
  hairLossOnset: 1, hairLossProgress: 1, affectedAreas: 1, familyHistory: 1, historyNotes: 1, previousTransplant: 1, previousDetails: 1,
  preferredDate: 3, dateFlexibility: 3, healthConsent: 2, privacyAcknowledged: 3, marketingConsent: 3,
};

const payloads = (v: Values) => ({
  aboutYou: {
    fullName: v.fullName,
    age: v.age,
    email: v.email,
    phone: v.phone,
    phoneIsWhatsApp: v.phoneIsWhatsApp,
    country: v.country,
    contactPreference: v.contactPreference,
  },
  hair: {
    hairLossOnset: v.hairLossOnset,
    hairLossProgress: v.hairLossProgress,
    affectedAreas: v.affectedAreas,
    familyHistory: v.familyHistory || undefined,
    historyNotes: v.historyNotes || undefined,
    previousTransplant: v.previousTransplant as boolean,
    previousDetails: v.previousDetails || undefined,
  },
  timing: { preferredDate: v.preferredDate, dateFlexibility: v.dateFlexibility },
  consent: { healthConsent: v.healthConsent, privacyAcknowledged: v.privacyAcknowledged, marketingConsent: v.marketingConsent },
});

const stripPrefix = (errs: Record<string, string>) =>
  Object.fromEntries(Object.entries(errs).map(([k, m]) => [k.split(".").pop()!, m]));

function monthOptions() {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 1; i <= 18; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() + i, 1);
    out.push({
      value: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`,
      label: m.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    });
  }
  return out;
}

export function AssessmentForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [v, setV] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [consentBusy, setConsentBusy] = useState(false);
  const [slots, setSlots] = useState<Record<PhotoSlotName, SlotState>>({ FRONT: { status: "empty" }, TOP: { status: "empty" }, CROWN: { status: "empty" }, DONOR: { status: "empty" } });
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const previews = useRef(new Set<string>());
  const reduce = useReducedMotion();
  const months = useMemo(monthOptions, []);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setV((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  // Release local previews when leaving the page.
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  // Warn before closing the tab mid-way through.
  useEffect(() => {
    if (reference) return;
    const dirty = step > 0 || v.fullName !== "";
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [step, v.fullName, reference]);

  const goTo = useCallback((next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setFormError(null);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  }, [step, reduce]);

  const allPhotosDone = PHOTO_SLOTS.every((s) => slots[s].status === "done");
  const anyBusy = PHOTO_SLOTS.some((s) => ["preparing", "uploading", "securing"].includes(slots[s].status));

  const validateStep = (i: number): boolean => {
    const p = payloads(v);
    let res: { success: boolean; error?: import("zod").ZodError } = { success: true };
    if (i === 0) res = aboutYouSchema.safeParse(p.aboutYou);
    if (i === 1) res = hairHistorySchema.safeParse(p.hair);
    if (i === 2) {
      if (!v.healthConsent) {
        setErrors({ healthConsent: "Please give consent so we can assess your photographs." });
        return false;
      }
      if (!allPhotosDone) {
        setFormError(anyBusy ? "Please wait for your photos to finish uploading." : "Please add all four photographs.");
        return false;
      }
    }
    if (i === 3) {
      const t = timingSchema.safeParse(p.timing);
      const c = consentSchema.safeParse(p.consent);
      const errs = { ...(t.success ? {} : fieldErrors(t.error)), ...(c.success ? {} : fieldErrors(c.error)) };
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (!res.success && res.error) {
      setErrors(fieldErrors(res.error));
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => validateStep(step) && goTo(step + 1);

  // ── Photographs ──────────────────────────────────────────────────────────
  const giveConsent = async (checked: boolean) => {
    set("healthConsent", checked);
    if (!checked || token) return;
    setConsentBusy(true);
    const res = await startUploadSession(true);
    setConsentBusy(false);
    if (res.ok) setToken(res.token);
    else {
      set("healthConsent", false);
      setFormError(res.error);
    }
  };

  const updateSlot = (slot: PhotoSlotName, state: SlotState) => setSlots((s) => ({ ...s, [slot]: state }));

  const handleFile = async (slot: PhotoSlotName, file: File) => {
    if (!token) return;
    setFormError(null);
    const old = slots[slot];
    updateSlot(slot, { status: "preparing", preview: "preview" in old ? old.preview : undefined });
    let blob: Blob;
    try {
      blob = await preparePhoto(file);
    } catch (e) {
      updateSlot(slot, { status: "error", message: (e as Error).message });
      return;
    }
    const preview = URL.createObjectURL(blob);
    previews.current.add(preview);
    updateSlot(slot, { status: "uploading", preview, progress: 0 });
    const res = await uploadPhoto(blob, slot, token, (f) =>
      updateSlot(slot, f >= 1 ? { status: "securing", preview } : { status: "uploading", preview, progress: f }),
    );
    if ("id" in res) updateSlot(slot, { status: "done", preview, id: res.id });
    else {
      updateSlot(slot, { status: "error", preview, message: res.error });
      if (res.status === 401) {
        setToken(null);
        set("healthConsent", false);
        setFormError("Your upload session expired. Please tick the consent box again and re-add your photos.");
      }
    }
  };

  const removeSlot = async (slot: PhotoSlotName) => {
    const s = slots[slot];
    if (s.status === "done" && token) await deletePhoto(s.id, token);
    updateSlot(slot, { status: "empty" });
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const submit = () => {
    if (!validateStep(3) || !token) return;
    startSubmit(async () => {
      const res = await submitAssessment({
        ...payloads(v),
        uploadToken: token,
        website: honeypot.current?.value ?? "",
        startedAt: startedAt.current,
      });
      if (res.ok) {
        setReference(res.reference);
        setDir(1);
        requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "auto", block: "start" }));
        return;
      }
      setFormError(res.error);
      if (res.fields) {
        const errs = stripPrefix(res.fields);
        setErrors(errs);
        const first = Math.min(...Object.keys(errs).map((k) => STEP_OF_FIELD[k] ?? 3));
        if (Number.isFinite(first) && first !== step) goTo(first);
      }
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (reference) return <Success reference={reference} preference={v.contactPreference} />;

  const e = errors;
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -32 }),
  };

  return (
    <div ref={top} className="scroll-mt-28">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between text-sm">
          <p>
            <span className="text-muted">Step {step + 1} of {STEPS.length} · </span>
            <span className="font-medium">{STEPS[step]}</span>
          </p>
          <p className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
            <Lock className="size-3.5" /> Private &amp; encrypted
          </p>
        </div>
        <ol className="mt-4 grid grid-cols-4 gap-2" aria-hidden>
          {STEPS.map((s, i) => (
            <li key={s} className="h-1 overflow-hidden rounded-full bg-line">
              <motion.div className="h-full bg-charcoal" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            </li>
          ))}
        </ol>
      </div>

      <form
        noValidate
        className="relative"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (step < 3) next();
          else submit();
        }}
      >
        {/* Honeypot */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <fieldset className="grid gap-6">
                <legend className="mb-8 font-display text-[2.2rem] leading-tight md:text-[2.6rem]">First, a little about you.</legend>
                <div className="grid gap-6 sm:grid-cols-[1fr_8rem]">
                  <Field id="fullName" label="Full name" error={e.fullName}>
                    <input className="field" autoComplete="name" value={v.fullName} onChange={(x) => set("fullName", x.target.value)} {...invalid("fullName", e.fullName)} />
                  </Field>
                  <Field id="age" label="Age" error={e.age}>
                    <input className="field" inputMode="numeric" autoComplete="off" value={v.age} onChange={(x) => set("age", x.target.value.replace(/\D/g, "").slice(0, 2))} {...invalid("age", e.age)} />
                  </Field>
                </div>
                <Field id="email" label="Email" error={e.email}>
                  <input className="field" type="email" autoComplete="email" inputMode="email" value={v.email} onChange={(x) => set("email", x.target.value)} {...invalid("email", e.email)} />
                </Field>
                <Field id="phone" label="Phone / WhatsApp" hint="Include your country code, e.g. +44 7700 900000" error={e.phone}>
                  <input className="field" type="tel" autoComplete="tel" inputMode="tel" value={v.phone} onChange={(x) => set("phone", x.target.value)} {...invalid("phone", e.phone)} />
                </Field>
                <Checkbox id="phoneIsWhatsApp" checked={v.phoneIsWhatsApp} onChange={(c) => set("phoneIsWhatsApp", c)}>
                  This number can receive WhatsApp messages
                </Checkbox>
                <Field id="country" label="Country of residence" error={e.country}>
                  <select className="field" autoComplete="country-name" value={v.country} onChange={(x) => set("country", x.target.value)} {...invalid("country", e.country)}>
                    <option value="" disabled>
                      Choose your country
                    </option>
                    {PINNED_COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                    <option disabled>──────────</option>
                    {COUNTRIES.slice(PINNED_COUNTRIES.length).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Chips name="contactPreference" legend="How should we contact you?" options={CONTACT_PREFERENCES} value={v.contactPreference} onChange={(x) => set("contactPreference", x as Values["contactPreference"])} />
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="grid gap-8">
                <legend className="mb-8 font-display text-[2.2rem] leading-tight md:text-[2.6rem]">Tell us about your hair.</legend>
                <Chips name="hairLossOnset" legend="When did you first notice hair loss?" options={HAIR_LOSS_ONSET} value={v.hairLossOnset} onChange={(x) => set("hairLossOnset", x as string)} error={e.hairLossOnset} />
                <Chips name="hairLossProgress" legend="Over the last year, has it…" options={HAIR_LOSS_PROGRESS} value={v.hairLossProgress} onChange={(x) => set("hairLossProgress", x as string)} error={e.hairLossProgress} />
                <Chips name="affectedAreas" legend="Which areas concern you?" multiple options={AFFECTED_AREAS} value={v.affectedAreas} onChange={(x) => set("affectedAreas", x as string[])} error={e.affectedAreas} />
                <Chips name="familyHistory" legend="Does hair loss run in your family?" optional options={FAMILY_HISTORY} value={v.familyHistory} onChange={(x) => set("familyHistory", x as string)} />
                <Chips
                  name="previousTransplant"
                  legend="Have you had a hair transplant before?"
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  value={v.previousTransplant === null ? "" : v.previousTransplant ? "yes" : "no"}
                  onChange={(x) => set("previousTransplant", x === "yes")}
                  error={e.previousTransplant}
                />
                <AnimatePresence initial={false}>
                  {v.previousTransplant && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <Field id="previousDetails" label="Tell us about it" hint="Roughly when, where, the technique and number of grafts if you know them." error={e.previousDetails}>
                        <textarea className="field resize-y" rows={3} value={v.previousDetails} onChange={(x) => set("previousDetails", x.target.value)} {...invalid("previousDetails", e.previousDetails)} />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Field id="historyNotes" label="Anything else we should know?" optional hint="E.g. treatments you've tried. Please don't include anything you're not comfortable sharing." error={e.historyNotes}>
                  <textarea className="field resize-y" rows={3} value={v.historyNotes} onChange={(x) => set("historyNotes", x.target.value)} {...invalid("historyNotes", e.historyNotes)} />
                </Field>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset className="grid gap-8">
                <legend className="mb-3 font-display text-[2.2rem] leading-tight md:text-[2.6rem]">Your photographs.</legend>
                <p className="-mt-4 max-w-xl leading-relaxed text-stone">
                  Four clear photos let Fatemeh assess your hair properly. Use good daylight, dry hair, no hat or styling products.
                </p>

                <div className={`rounded-2xl border p-5 md:p-6 ${v.healthConsent ? "border-charcoal/20 bg-ivory-raised" : "border-bronze/40 bg-bronze-pale/30"}`}>
                  <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Lock className="size-4 text-bronze" /> Your consent
                  </p>
                  <Checkbox id="healthConsent" checked={v.healthConsent} onChange={giveConsent} error={e.healthConsent}>
                    I give my <strong className="text-charcoal">explicit consent</strong> for {site.brand} {site.descriptor} to process my photographs and
                    the health information I provide, for the sole purpose of assessing my suitability for treatment and preparing a
                    quotation. I can withdraw consent and ask for my data to be deleted at any time. (
                    <Link href="/privacy" target="_blank" className="underline underline-offset-2">
                      privacy notice
                    </Link>
                    )
                  </Checkbox>
                  {consentBusy && <p className="mt-2 pl-8 text-xs text-muted">Preparing secure upload…</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {PHOTO_SLOTS.map((slot) => (
                    <PhotoSlot key={slot} slot={slot} state={slots[slot]} disabled={!token} onFile={(f) => handleFile(slot, f)} onRemove={() => removeSlot(slot)} />
                  ))}
                </div>
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                  <Lock className="mt-0.5 size-3.5 shrink-0" />
                  Photos are resized on your device, encrypted the moment they reach us and stored privately. Hidden location data is
                  removed. They are never published, shared or emailed.
                </p>
              </fieldset>
            )}

            {step === 3 && (
              <fieldset className="grid gap-8">
                <legend className="mb-8 font-display text-[2.2rem] leading-tight md:text-[2.6rem]">Timing, and a final check.</legend>
                <Field id="preferredDate" label="When would you ideally like treatment?" error={e.preferredDate}>
                  <select className="field" value={v.preferredDate} onChange={(x) => set("preferredDate", x.target.value)} {...invalid("preferredDate", e.preferredDate)}>
                    <option value="" disabled>
                      Choose a month
                    </option>
                    <option value="flexible">I&apos;m flexible / not sure yet</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </Field>
                {v.preferredDate && v.preferredDate !== "flexible" && (
                  <Chips name="dateFlexibility" legend="How flexible are you?" options={DATE_FLEXIBILITY} value={v.dateFlexibility} onChange={(x) => set("dateFlexibility", x as string)} />
                )}

                <Review v={v} onEdit={goTo} />

                <div className="grid gap-4 rounded-2xl border border-line bg-ivory-raised p-5 md:p-6">
                  <Checkbox id="privacyAcknowledged" checked={v.privacyAcknowledged} onChange={(c) => set("privacyAcknowledged", c)} error={e.privacyAcknowledged}>
                    I&apos;ve read the{" "}
                    <Link href="/privacy" target="_blank" className="underline underline-offset-2">
                      privacy notice
                    </Link>{" "}
                    and confirm the information I&apos;ve given is accurate.
                  </Checkbox>
                  <Checkbox id="marketingConsent" checked={v.marketingConsent} onChange={(c) => set("marketingConsent", c)}>
                    <span className="text-muted">Optional:</span> I&apos;d like occasional news and guidance by email. You can unsubscribe at any time.
                  </Checkbox>
                </div>
              </fieldset>
            )}
          </motion.div>
        </AnimatePresence>

        {formError && (
          <p role="alert" className="mt-8 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {formError}
          </p>
        )}

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => goTo(step - 1)} className={buttonClass("ghost", "px-0")}>
              <ArrowRight className="size-4 rotate-180" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button type="submit" disabled={step === 2 && anyBusy} className={buttonClass("primary", "py-4 pl-7 pr-3")}>
              Continue <ArrowBadge />
            </button>
          ) : (
            <button type="submit" disabled={submitting} className={buttonClass("primary", "py-4 pl-7 pr-3")}>
              {submitting ? "Submitting securely…" : "Submit my assessment"} <ArrowBadge />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Review({ v, onEdit }: { v: Values; onEdit: (step: number) => void }) {
  const label = (list: readonly { value: string; label: string }[], val: string) => list.find((o) => o.value === val)?.label ?? "—";
  const rows: [number, string, string][] = [
    [0, "Name", v.fullName],
    [0, "Age", v.age],
    [0, "Email", v.email],
    [0, "Phone", `${v.phone}${v.phoneIsWhatsApp ? " (WhatsApp)" : ""}`],
    [0, "Country", v.country],
    [1, "Hair loss began", label(HAIR_LOSS_ONSET, v.hairLossOnset)],
    [1, "Areas", v.affectedAreas.map((a) => label(AFFECTED_AREAS, a)).join(", ")],
    [1, "Previous transplant", v.previousTransplant ? "Yes" : "No"],
    [2, "Photographs", `${PHOTO_SLOTS.map((s) => SLOT_INFO[s].title).join(", ")}`],
  ];
  return (
    <div className="rounded-2xl border border-line">
      <p className="border-b border-line px-5 py-3 text-sm font-medium">Your answers</p>
      <dl className="divide-y divide-line text-sm">
        {rows.map(([s, k, val]) => (
          <div key={k} className="grid grid-cols-[8.5rem_1fr_auto] items-baseline gap-3 px-5 py-3">
            <dt className="text-muted">{k}</dt>
            <dd className="min-w-0 break-words">{val || "—"}</dd>
            <button type="button" onClick={() => onEdit(s)} className="text-xs text-bronze underline-offset-2 hover:underline" aria-label={`Edit ${k}`}>
              Edit
            </button>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Success({ reference, preference }: { reference: string; preference: Values["contactPreference"] }) {
  const via = { EMAIL: "by email", WHATSAPP: "on WhatsApp", PHONE: "by phone" }[preference];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} role="status">
      <span className="grid size-14 place-items-center rounded-full bg-charcoal text-ivory">
        <Check className="size-6" />
      </span>
      <h2 className="display mt-8 text-[clamp(2.4rem,5vw,3.6rem)]">
        Thank you. Your assessment is <em>safely with us.</em>
      </h2>
      <div className="mt-8 inline-block rounded-2xl border border-line bg-ivory-raised px-6 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Your reference</p>
        <p className="mt-1 font-display text-3xl tracking-[0.06em]">{reference}</p>
      </div>
      <p className="mt-6 max-w-xl leading-relaxed text-stone">
        Please keep this reference. Fatemeh will review your photographs and answers personally and contact you {via}. If you&apos;re
        suitable, you&apos;ll receive a personalised quotation. There&apos;s no obligation to go ahead.
      </p>
      <ol className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
        {["Personal review of your photos", "Your assessment & quotation", "You decide, in your own time"].map((t, i) => (
          <li key={t} className="rounded-xl border border-line p-4">
            <span className="font-display text-lg text-bronze">0{i + 1}</span>
            <p className="mt-1">{t}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/results" className={buttonClass("outline")}>
          View results
        </Link>
        <Link href="/" className={buttonClass("ghost")}>
          Back to home
        </Link>
      </div>
    </motion.div>
  );
}
