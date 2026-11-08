import { z } from "zod";
import { COUNTRIES } from "@/content/countries";

// Our Content Security Policy forbids eval; tell Zod not to even try.
z.config({ jitless: true });

/** Shared by the browser (instant feedback) and the server (the real check). */

export const CONSENT_VERSION = "2026-11-v1";

export const HAIR_LOSS_ONSET = [
  { value: "under-1", label: "Less than a year" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10-plus", label: "More than 10 years" },
] as const;

export const HAIR_LOSS_PROGRESS = [
  { value: "stable", label: "Stable" },
  { value: "slow", label: "Slowly getting worse" },
  { value: "fast", label: "Quickly getting worse" },
  { value: "unsure", label: "Not sure" },
] as const;

export const AFFECTED_AREAS = [
  { value: "hairline", label: "Hairline" },
  { value: "temples", label: "Temples" },
  { value: "top", label: "Top / mid-scalp" },
  { value: "crown", label: "Crown" },
  { value: "diffuse", label: "General thinning" },
] as const;

export const FAMILY_HISTORY = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

export const DATE_FLEXIBILITY = [
  { value: "fixed", label: "I need this month" },
  { value: "around", label: "Around this time" },
  { value: "flexible", label: "Fully flexible" },
] as const;

export const CONTACT_PREFERENCES = [
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "PHONE", label: "Phone call" },
] as const;

export const PHOTO_SLOTS = ["FRONT", "TOP", "CROWN", "DONOR"] as const;
export type PhotoSlotName = (typeof PHOTO_SLOTS)[number];

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

const trimmed = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters.`);

export const aboutYouSchema = z.object({
  fullName: trimmed(100).min(2, "Please enter your full name."),
  age: z.coerce
    .number({ message: "Please enter your age." })
    .int("Please enter a whole number.")
    .min(18, "You must be 18 or over to request an assessment.")
    .max(99, "Please check your age."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,22}$/, "Please enter a valid phone number, including country code."),
  phoneIsWhatsApp: z.boolean(),
  country: z.string().refine((c) => (COUNTRIES as readonly string[]).includes(c), "Please choose your country."),
  contactPreference: z.enum(values(CONTACT_PREFERENCES)),
});

export const hairHistorySchema = z
  .object({
    hairLossOnset: z.enum(values(HAIR_LOSS_ONSET), { message: "Please choose when it started." }),
    hairLossProgress: z.enum(values(HAIR_LOSS_PROGRESS), { message: "Please choose one." }),
    affectedAreas: z.array(z.enum(values(AFFECTED_AREAS))).min(1, "Choose at least one area.").max(5),
    familyHistory: z.enum(values(FAMILY_HISTORY)).optional(),
    historyNotes: trimmed(1000).optional(),
    previousTransplant: z.boolean({ message: "Please answer this question." }),
    previousDetails: trimmed(1000).optional(),
  })
  .refine((d) => !d.previousTransplant || (d.previousDetails?.length ?? 0) >= 3, {
    path: ["previousDetails"],
    message: "Please tell us roughly when and where, and the technique if you know it.",
  });

export const timingSchema = z.object({
  preferredDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Please choose a month.")
    .or(z.literal("flexible")),
  dateFlexibility: z.enum(values(DATE_FLEXIBILITY)),
});

export const consentSchema = z.object({
  healthConsent: z.literal(true, { message: "We need your consent to assess your photographs." }),
  privacyAcknowledged: z.literal(true, { message: "Please confirm you've read the privacy notice." }),
  marketingConsent: z.boolean().default(false),
});

export const assessmentSchema = z.object({
  aboutYou: aboutYouSchema,
  hair: hairHistorySchema,
  timing: timingSchema,
  consent: consentSchema,
  uploadToken: z.string().min(20).max(100),
  // anti-spam
  website: z.string().max(0).optional(), // honeypot: real people never see this field
  startedAt: z.number().int(),
});

export type AssessmentInput = z.input<typeof assessmentSchema>;

export const CONTACT_TOPICS = [
  "General question",
  "Treatment information",
  "An existing enquiry",
  "Privacy or data request",
  "Something else",
] as const;

export const contactSchema = z.object({
  name: trimmed(100).min(2, "Please enter your name."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,22}$/, "Please enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  topic: z.enum(CONTACT_TOPICS),
  message: trimmed(3000).min(10, "Please write a little more."),
  privacyAcknowledged: z.literal(true, { message: "Please confirm you've read the privacy notice." }),
  website: z.string().max(0).optional(),
  startedAt: z.number().int(),
});

export type ContactInput = z.input<typeof contactSchema>;

/** Flattens zod issues to { "aboutYou.email": "message" } for the form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
