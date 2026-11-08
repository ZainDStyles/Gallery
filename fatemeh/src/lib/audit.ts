import "server-only";
import { db } from "./db";
import { clientIpHash } from "./request";

export type AuditAction =
  | "LOGIN_SUCCEEDED"
  | "LOGIN_FAILED"
  | "LOGIN_LOCKED"
  | "MFA_ENABLED"
  | "MFA_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "ENQUIRY_CREATED"
  | "ENQUIRY_VIEWED"
  | "PHOTO_VIEWED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED"
  | "QUOTE_SAVED"
  | "APPOINTMENT_SAVED"
  | "DEPOSIT_SAVED"
  | "RETENTION_CHANGED"
  | "ENQUIRY_EXPORTED"
  | "ENQUIRY_DELETED"
  | "ENQUIRY_AUTO_DELETED"
  | "MESSAGE_CREATED"
  | "MESSAGE_VIEWED"
  | "MESSAGE_DELETED"
  | "RETENTION_RUN";

/** Records who did what. Never pass patient details in `detail`. */
export async function audit(entry: {
  action: AuditAction;
  actorId?: string | null;
  targetType?: string;
  targetId?: string;
  reference?: string;
  detail?: string;
  withIp?: boolean;
}) {
  try {
    await db().auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId ?? null,
        targetType: entry.targetType,
        targetId: entry.targetId,
        reference: entry.reference,
        detail: entry.detail?.slice(0, 300),
        ipHash: entry.withIp === false ? null : await clientIpHash().catch(() => null),
      },
    });
  } catch (err) {
    console.error("[audit] failed to write log", err);
  }
}
