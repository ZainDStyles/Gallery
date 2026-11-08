import "server-only";
import { db } from "./db";
import { removePrivate } from "./storage";
import { audit } from "./audit";
import { env } from "./env";

/** Permanently deletes an enquiry: encrypted files first, then database rows. */
export async function deleteEnquiryCompletely(id: string, actorId: string | null, auto = false) {
  const enquiry = await db().enquiry.findUnique({
    where: { id },
    select: { reference: true, photos: { select: { storageKey: true, thumbKey: true } } },
  });
  if (!enquiry) return false;
  await removePrivate(...enquiry.photos.flatMap((p) => [p.storageKey, p.thumbKey]));
  await db().enquiry.delete({ where: { id } });
  await audit({
    action: auto ? "ENQUIRY_AUTO_DELETED" : "ENQUIRY_DELETED",
    actorId,
    targetType: "Enquiry",
    targetId: id,
    reference: enquiry.reference,
    withIp: !auto,
  });
  return true;
}

/** Marks an enquiry as recently worked on (resets its retention clock). */
export const touchEnquiry = (id: string) =>
  db().enquiry.update({ where: { id }, data: { lastActivityAt: new Date() } });

export function scheduledDeletion(lastActivityAt: Date, hold: boolean): Date | null {
  if (hold) return null;
  const d = new Date(lastActivityAt);
  d.setMonth(d.getMonth() + env().RETENTION_MONTHS);
  return d;
}

const monthsAgo = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};

/**
 * Data retention job (runs daily via /api/cron/retention).
 *  - abandoned uploads (form never submitted) → deleted after 24 hours
 *  - enquiries with no activity for RETENTION_MONTHS → deleted, unless on hold
 *  - contact messages older than CONTACT_RETENTION_MONTHS → deleted
 *  - audit logs older than AUDIT_RETENTION_MONTHS → deleted
 */
export async function runRetention() {
  const e = env();
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 3600_000);

  const abandoned = await db().photo.findMany({
    where: { enquiryId: null, createdAt: { lt: dayAgo } },
    select: { id: true, storageKey: true, thumbKey: true },
  });
  await removePrivate(...abandoned.flatMap((p) => [p.storageKey, p.thumbKey]));
  await db().photo.deleteMany({ where: { id: { in: abandoned.map((p) => p.id) } } });
  await db().uploadSession.deleteMany({ where: { expiresAt: { lt: now } } });

  const stale = await db().enquiry.findMany({
    where: { retentionHold: false, lastActivityAt: { lt: monthsAgo(e.RETENTION_MONTHS) } },
    select: { id: true },
  });
  for (const { id } of stale) await deleteEnquiryCompletely(id, null, true);

  const messages = await db().contactMessage.deleteMany({ where: { createdAt: { lt: monthsAgo(e.CONTACT_RETENTION_MONTHS) } } });
  await db().auditLog.deleteMany({ where: { createdAt: { lt: monthsAgo(e.AUDIT_RETENTION_MONTHS) } } });
  await db().adminSession.deleteMany({ where: { expiresAt: { lt: now } } });
  await db().rateLimit.deleteMany({ where: { windowStart: { lt: dayAgo } } });

  const summary = { abandonedPhotos: abandoned.length, enquiriesDeleted: stale.length, messagesDeleted: messages.count };
  await audit({ action: "RETENTION_RUN", detail: JSON.stringify(summary), withIp: false });
  return summary;
}
