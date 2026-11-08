"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { deleteEnquiryCompletely, touchEnquiry } from "@/lib/enquiries";
import { AppointmentStatus, DepositStatus, EnquiryStatus, MessageStatus, QuoteStatus } from "@/generated/prisma/enums";

/*
 * Every action re-checks the admin session first (never trust the page that
 * rendered the form) and validates its input on the server.
 */

const id = z.string().min(1).max(40);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));
const money = z
  .string()
  .trim()
  .regex(/^\d{1,7}(\.\d{1,2})?$/, "Enter an amount like 2500 or 2500.00")
  .transform((v) => Math.round(parseFloat(v) * 100));
const currency = z.enum(["GBP", "EUR", "USD", "TRY", "AED"]);
const dateInput = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((v) => new Date(`${v}T12:00:00Z`));
const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00Z`) : null));

const read = (form: FormData) => Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
const refresh = (enquiryId: string) => revalidatePath(`/admin/enquiries/${enquiryId}`);

async function enquiryRef(enquiryId: string) {
  const e = await db().enquiry.findUnique({ where: { id: enquiryId }, select: { reference: true } });
  if (!e) throw new Error("Enquiry not found");
  return e.reference;
}

export async function updateStatus(form: FormData) {
  const user = await requireAdmin();
  const d = z.object({ enquiryId: id, status: z.enum(EnquiryStatus) }).parse(read(form));
  const before = await db().enquiry.update({ where: { id: d.enquiryId }, data: { status: d.status, lastActivityAt: new Date() } });
  await audit({ action: "STATUS_CHANGED", actorId: user.id, targetType: "Enquiry", targetId: d.enquiryId, reference: before.reference, detail: d.status });
  refresh(d.enquiryId);
  revalidatePath("/admin");
}

export async function addNote(form: FormData) {
  const user = await requireAdmin();
  const d = z.object({ enquiryId: id, body: z.string().trim().min(1).max(5000) }).parse(read(form));
  await db().enquiryNote.create({ data: { enquiryId: d.enquiryId, authorId: user.id, body: d.body } });
  await touchEnquiry(d.enquiryId);
  await audit({ action: "NOTE_ADDED", actorId: user.id, targetType: "Enquiry", targetId: d.enquiryId, reference: await enquiryRef(d.enquiryId) });
  refresh(d.enquiryId);
}

export async function saveQuote(form: FormData) {
  const user = await requireAdmin();
  const d = z
    .object({
      enquiryId: id,
      technique: z.string().trim().min(2).max(80),
      graftsMin: z.coerce.number().int().min(0).max(10000).optional().or(z.literal("").transform(() => undefined)),
      graftsMax: z.coerce.number().int().min(0).max(10000).optional().or(z.literal("").transform(() => undefined)),
      amount: money,
      currency,
      includes: optionalText(2000),
      validUntil: optionalDate,
      markSent: z.string().optional(),
    })
    .parse(read(form));
  const sent = d.markSent === "on";
  await db().quote.create({
    data: {
      enquiryId: d.enquiryId,
      technique: d.technique,
      graftsMin: d.graftsMin ?? null,
      graftsMax: d.graftsMax ?? null,
      amount: d.amount,
      currency: d.currency,
      includes: d.includes,
      validUntil: d.validUntil,
      status: sent ? "SENT" : "DRAFT",
      sentAt: sent ? new Date() : null,
    },
  });
  if (sent) {
    await db().enquiry.updateMany({ where: { id: d.enquiryId, status: { in: ["NEW", "IN_REVIEW", "AWAITING_INFO"] } }, data: { status: "QUOTED" } });
  }
  await touchEnquiry(d.enquiryId);
  await audit({ action: "QUOTE_SAVED", actorId: user.id, targetType: "Enquiry", targetId: d.enquiryId, reference: await enquiryRef(d.enquiryId), detail: sent ? "sent" : "draft" });
  refresh(d.enquiryId);
}

export async function setQuoteStatus(form: FormData) {
  const user = await requireAdmin();
  const d = z.object({ quoteId: id, status: z.enum(QuoteStatus) }).parse(read(form));
  const q = await db().quote.update({
    where: { id: d.quoteId },
    data: { status: d.status, sentAt: d.status === "SENT" ? new Date() : undefined },
  });
  await touchEnquiry(q.enquiryId);
  await audit({ action: "QUOTE_SAVED", actorId: user.id, targetType: "Quote", targetId: q.id, reference: await enquiryRef(q.enquiryId), detail: d.status });
  refresh(q.enquiryId);
}

export async function saveAppointment(form: FormData) {
  const user = await requireAdmin();
  const d = z.object({ enquiryId: id, date: dateInput, notes: optionalText(1000), confirm: z.string().optional() }).parse(read(form));
  const confirm = d.confirm === "on";
  await db().appointment.create({
    data: { enquiryId: d.enquiryId, date: d.date, notes: d.notes, status: confirm ? "CONFIRMED" : "PROPOSED", confirmedAt: confirm ? new Date() : null },
  });
  if (confirm) await db().enquiry.update({ where: { id: d.enquiryId }, data: { status: "BOOKED" } });
  await touchEnquiry(d.enquiryId);
  await audit({ action: "APPOINTMENT_SAVED", actorId: user.id, targetType: "Enquiry", targetId: d.enquiryId, reference: await enquiryRef(d.enquiryId), detail: confirm ? "confirmed" : "proposed" });
  refresh(d.enquiryId);
  revalidatePath("/admin/appointments");
}

/** Manual approval: Fatemeh confirms (or cancels / completes) an appointment. */
export async function setAppointmentStatus(form: FormData) {
  const user = await requireAdmin();
  const d = z.object({ appointmentId: id, status: z.enum(AppointmentStatus) }).parse(read(form));
  const a = await db().appointment.update({
    where: { id: d.appointmentId },
    data: { status: d.status, confirmedAt: d.status === "CONFIRMED" ? new Date() : undefined },
  });
  if (d.status === "CONFIRMED") await db().enquiry.update({ where: { id: a.enquiryId }, data: { status: "BOOKED" } });
  if (d.status === "COMPLETED") await db().enquiry.update({ where: { id: a.enquiryId }, data: { status: "COMPLETED", retentionHold: true } });
  await touchEnquiry(a.enquiryId);
  await audit({ action: "APPOINTMENT_SAVED", actorId: user.id, targetType: "Appointment", targetId: a.id, reference: await enquiryRef(a.enquiryId), detail: d.status });
  refresh(a.enquiryId);
  revalidatePath("/admin/appointments");
}

export async function saveDeposit(form: FormData) {
  const user = await requireAdmin();
  const d = z
    .object({
      enquiryId: id,
      amount: money,
      currency,
      status: z.enum(DepositStatus),
      method: optionalText(60),
      providerRef: optionalText(120),
      paidAt: optionalDate,
      notes: optionalText(1000),
    })
    .parse(read(form));
  await db().deposit.create({
    data: {
      enquiryId: d.enquiryId,
      amount: d.amount,
      currency: d.currency,
      status: d.status,
      method: d.method,
      providerRef: d.providerRef,
      paidAt: d.status === "PAID" ? (d.paidAt ?? new Date()) : null,
      notes: d.notes,
      provider: "MANUAL",
    },
  });
  if (d.status === "REQUESTED") {
    await db().enquiry.updateMany({ where: { id: d.enquiryId, status: { in: ["NEW", "IN_REVIEW", "AWAITING_INFO", "QUOTED"] } }, data: { status: "DEPOSIT_PENDING" } });
  }
  await touchEnquiry(d.enquiryId);
  await audit({ action: "DEPOSIT_SAVED", actorId: user.id, targetType: "Enquiry", targetId: d.enquiryId, reference: await enquiryRef(d.enquiryId), detail: d.status });
  refresh(d.enquiryId);
}

export async function setDepositStatus(form: FormData) {
  const user = await requireAdmin();
  const d = z.object({ depositId: id, status: z.enum(DepositStatus) }).parse(read(form));
  const dep = await db().deposit.update({
    where: { id: d.depositId },
    data: { status: d.status, paidAt: d.status === "PAID" ? new Date() : undefined },
  });
  await touchEnquiry(dep.enquiryId);
  await audit({ action: "DEPOSIT_SAVED", actorId: user.id, targetType: "Deposit", targetId: dep.id, reference: await enquiryRef(dep.enquiryId), detail: d.status });
  refresh(dep.enquiryId);
}

export async function setRetentionHold(form: FormData) {
  const user = await requireAdmin({ owner: true });
  const d = z.object({ enquiryId: id, hold: z.enum(["true", "false"]) }).parse(read(form));
  const e = await db().enquiry.update({ where: { id: d.enquiryId }, data: { retentionHold: d.hold === "true", lastActivityAt: new Date() } });
  await audit({ action: "RETENTION_CHANGED", actorId: user.id, targetType: "Enquiry", targetId: e.id, reference: e.reference, detail: d.hold === "true" ? "hold on" : "hold off" });
  refresh(d.enquiryId);
}

/** Permanent erasure (e.g. a patient's deletion request). Requires typing the reference. */
export async function deleteEnquiry(form: FormData) {
  const user = await requireAdmin({ owner: true });
  const d = z.object({ enquiryId: id, confirm: z.string().trim().toUpperCase() }).parse(read(form));
  const reference = await enquiryRef(d.enquiryId);
  if (d.confirm !== reference) redirect(`/admin/enquiries/${d.enquiryId}?deleteError=1#privacy`);
  await deleteEnquiryCompletely(d.enquiryId, user.id);
  revalidatePath("/admin");
  redirect("/admin?deleted=" + encodeURIComponent(reference));
}

export async function setMessageStatus(form: FormData) {
  const user = await requireAdmin();
  const d = z.object({ messageId: id, status: z.enum(MessageStatus) }).parse(read(form));
  const m = await db().contactMessage.update({ where: { id: d.messageId }, data: { status: d.status } });
  await audit({ action: "MESSAGE_VIEWED", actorId: user.id, targetType: "ContactMessage", targetId: m.id, reference: m.reference, detail: d.status });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(form: FormData) {
  const user = await requireAdmin({ owner: true });
  const d = z.object({ messageId: id }).parse(read(form));
  const m = await db().contactMessage.delete({ where: { id: d.messageId } });
  await audit({ action: "MESSAGE_DELETED", actorId: user.id, targetType: "ContactMessage", targetId: m.id, reference: m.reference });
  revalidatePath("/admin/messages");
}
