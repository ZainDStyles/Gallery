"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { humanReference, randomToken, sha256 } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpHash } from "@/lib/request";
import { audit } from "@/lib/audit";
import { confirmToPatient, notifyNewEnquiry, notifyNewMessage } from "@/lib/email";
import { assessmentSchema, CONSENT_VERSION, contactSchema, fieldErrors, PHOTO_SLOTS } from "@/lib/validation";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string; fields?: Record<string, string> };

const MIN_FILL_MS = 4000; // bots submit instantly; people don't
const SESSION_HOURS = 6;

/**
 * Called when the visitor ticks the health-data consent box on the photo step.
 * Returns a one-time token that authorises photo uploads for this form only.
 */
export async function startUploadSession(consent: boolean): Promise<Result<{ token: string }>> {
  if (consent !== true) return { ok: false, error: "Consent is required before uploading photographs." };
  const ipHash = await clientIpHash();
  if (!(await rateLimit("upload-session", ipHash, 10, 3600))) {
    return { ok: false, error: "Too many attempts. Please try again in an hour, or contact us directly." };
  }
  const token = randomToken();
  await db().uploadSession.create({
    data: { tokenHash: sha256(token), ipHash, consentAt: new Date(), expiresAt: new Date(Date.now() + SESSION_HOURS * 3600_000) },
  });
  return { ok: true, token };
}

export async function submitAssessment(input: unknown): Promise<Result<{ reference: string }>> {
  const parsed = assessmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted answers.", fields: fieldErrors(parsed.error) };
  const data = parsed.data;

  if (data.website || Date.now() - data.startedAt < MIN_FILL_MS) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const ipHash = await clientIpHash();
  if (!(await rateLimit("assessment", ipHash, 5, 3600))) {
    return { ok: false, error: "Too many submissions from this connection. Please try again later or contact us directly." };
  }

  const session = await db().uploadSession.findUnique({
    where: { tokenHash: sha256(data.uploadToken) },
    include: { photos: { select: { id: true, slot: true } } },
  });
  if (!session || session.expiresAt < new Date()) {
    return { ok: false, error: "Your upload session expired. Please re-add your photographs." };
  }
  const slots = new Set(session.photos.map((p) => p.slot));
  const missing = PHOTO_SLOTS.filter((s) => !slots.has(s));
  if (missing.length) return { ok: false, error: "Please add all four photographs before submitting." };

  const a = data.aboutYou;
  const h = data.hair;

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = humanReference("FA");
    try {
      const enquiry = await db().$transaction(async (tx) => {
        const created = await tx.enquiry.create({
          data: {
            reference,
            fullName: a.fullName,
            age: a.age,
            email: a.email,
            phone: a.phone,
            phoneIsWhatsApp: a.phoneIsWhatsApp,
            country: a.country,
            contactPreference: a.contactPreference,
            hairLossOnset: h.hairLossOnset,
            hairLossProgress: h.hairLossProgress,
            affectedAreas: h.affectedAreas,
            familyHistory: h.familyHistory,
            historyNotes: h.historyNotes || null,
            previousTransplant: h.previousTransplant,
            previousDetails: h.previousTransplant ? h.previousDetails || null : null,
            preferredDate: data.timing.preferredDate,
            dateFlexibility: data.timing.dateFlexibility,
            healthConsentAt: session.consentAt,
            consentVersion: CONSENT_VERSION,
            marketingConsent: data.consent.marketingConsent,
          },
        });
        await tx.photo.updateMany({ where: { sessionId: session.id }, data: { enquiryId: created.id, sessionId: null } });
        await tx.uploadSession.delete({ where: { id: session.id } });
        return created;
      });

      await audit({ action: "ENQUIRY_CREATED", targetType: "Enquiry", targetId: enquiry.id, reference });
      after(async () => {
        await notifyNewEnquiry(enquiry.id, reference).catch((e) => console.error("[email] enquiry notification failed", e));
        await confirmToPatient(a.email, reference).catch((e) => console.error("[email] patient confirmation failed", e));
      });
      return { ok: true, reference };
    } catch (err) {
      if ((err as { code?: string }).code === "P2002") continue; // reference collision: try another
      console.error("[assessment] submit failed", err);
      return { ok: false, error: "We couldn't save your assessment. Please try again in a moment." };
    }
  }
  return { ok: false, error: "We couldn't save your assessment. Please try again." };
}

export async function submitContact(input: unknown): Promise<Result<{ reference: string }>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (d.website || Date.now() - d.startedAt < 3000) return { ok: false, error: "Something went wrong. Please try again." };

  const ipHash = await clientIpHash();
  if (!(await rateLimit("contact", ipHash, 5, 3600))) {
    return { ok: false, error: "Too many messages from this connection. Please try again later." };
  }

  const reference = humanReference("CM");
  const msg = await db().contactMessage.create({
    data: { reference, name: d.name, email: d.email, phone: d.phone || null, topic: d.topic, message: d.message },
  });
  await audit({ action: "MESSAGE_CREATED", targetType: "ContactMessage", targetId: msg.id, reference });
  after(() => notifyNewMessage(reference).catch((e) => console.error("[email] message notification failed", e)));
  return { ok: true, reference };
}
