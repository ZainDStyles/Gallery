import { AFFECTED_AREAS, DATE_FLEXIBILITY, FAMILY_HISTORY, HAIR_LOSS_ONSET, HAIR_LOSS_PROGRESS } from "@/lib/validation";

export const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  IN_REVIEW: "In review",
  AWAITING_INFO: "Awaiting info",
  QUOTED: "Quoted",
  DEPOSIT_PENDING: "Deposit pending",
  BOOKED: "Booked",
  COMPLETED: "Completed",
  NOT_SUITABLE: "Not suitable",
  CLOSED: "Closed",
};

export const STATUS_TONE: Record<string, string> = {
  NEW: "bg-bronze text-ivory",
  IN_REVIEW: "bg-bronze-pale text-bronze",
  AWAITING_INFO: "bg-sand text-stone",
  QUOTED: "bg-[#e3e8ef] text-[#2f4b6e]",
  DEPOSIT_PENDING: "bg-[#f3e6c8] text-[#7a5a12]",
  BOOKED: "bg-[#dde9df] text-success",
  COMPLETED: "bg-charcoal text-ivory",
  NOT_SUITABLE: "bg-sand text-muted",
  CLOSED: "bg-sand text-muted",
};

const find = (list: readonly { value: string; label: string }[], v?: string | null) => list.find((o) => o.value === v)?.label ?? v ?? "—";
export const onsetLabel = (v: string) => find(HAIR_LOSS_ONSET, v);
export const progressLabel = (v: string) => find(HAIR_LOSS_PROGRESS, v);
export const familyLabel = (v?: string | null) => find(FAMILY_HISTORY, v);
export const flexLabel = (v?: string | null) => find(DATE_FLEXIBILITY, v);
export const areasLabel = (vs: string[]) => vs.map((v) => find(AFFECTED_AREAS, v)).join(", ");

export const SLOT_LABEL: Record<string, string> = { FRONT: "Front hairline", TOP: "Top of head", CROWN: "Crown", DONOR: "Donor area" };

export function preferredDateLabel(v?: string | null) {
  if (!v) return "—";
  if (v === "flexible") return "Flexible";
  const [y, m] = v.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export const fmtDate = (d: Date | null | undefined, withTime = false) =>
  d
    ? d.toLocaleString("en-GB", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" })
    : "—";
