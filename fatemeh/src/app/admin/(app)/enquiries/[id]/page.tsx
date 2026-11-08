import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { scheduledDeletion } from "@/lib/enquiries";
import { formatMoney, paymentsEnabled } from "@/lib/payments";
import {
  addNote,
  deleteEnquiry,
  saveAppointment,
  saveDeposit,
  saveQuote,
  setAppointmentStatus,
  setDepositStatus,
  setQuoteStatus,
  setRetentionHold,
  updateStatus,
} from "@/app/actions/admin";
import { Card, DL, Pill, StatusBadge, btnGhostCls, inputCls, labelCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { PhotoViewer } from "@/components/admin/PhotoViewer";
import { areasLabel, familyLabel, flexLabel, fmtDate, onsetLabel, preferredDateLabel, progressLabel, SLOT_LABEL, STATUS_LABEL } from "@/components/admin/labels";
import { PHOTO_SLOTS } from "@/lib/validation";
import { EnquiryStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Enquiry" };

const CURRENCIES = ["GBP", "EUR", "USD", "TRY", "AED"];
const today = () => new Date().toISOString().slice(0, 10);

export default async function EnquiryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ deleteError?: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const { deleteError } = await searchParams;

  const e = await db().enquiry.findUnique({
    where: { id },
    include: {
      photos: { select: { id: true, slot: true } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      quotes: { orderBy: { createdAt: "desc" } },
      appointments: { orderBy: { date: "asc" } },
      deposits: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!e) notFound();
  await audit({ action: "ENQUIRY_VIEWED", actorId: user.id, targetType: "Enquiry", targetId: e.id, reference: e.reference });

  const isOwner = user.role === "OWNER";
  const deletion = scheduledDeletion(e.lastActivityAt, e.retentionHold);
  const photos = PHOTO_SLOTS.flatMap((slot) => e.photos.filter((p) => p.slot === slot).map((p) => ({ id: p.id, slot, label: SLOT_LABEL[slot] })));
  const waNumber = e.phone.replace(/[^\d]/g, "");
  const contactPref = { EMAIL: "Email", WHATSAPP: "WhatsApp", PHONE: "Phone call" }[e.contactPreference];

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin" className="text-sm text-stone hover:text-charcoal">
        ← Enquiries
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-sm tracking-wider text-bronze">{e.reference}</p>
          <h1 className="mt-1 font-display text-4xl">{e.fullName}</h1>
          <p className="mt-1 text-sm text-stone">
            {e.age} · {e.country} · received {fmtDate(e.createdAt, true)}
          </p>
        </div>
        <form key={e.status} action={updateStatus} className="flex items-end gap-2">
          <input type="hidden" name="enquiryId" value={e.id} />
          <div>
            <label htmlFor="status" className={labelCls}>
              Status
            </label>
            <select id="status" name="status" defaultValue={e.status} className={inputCls}>
              {Object.values(EnquiryStatus).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <SubmitButton>Update</SubmitButton>
        </form>
      </header>
      <div className="mt-3">
        <StatusBadge status={e.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 gap-6">
          <Card title="Photographs">
            <PhotoViewer photos={photos} />
          </Card>

          <Card title="Hair-loss history">
            <DL
              rows={[
                ["Noticed", onsetLabel(e.hairLossOnset)],
                ["Last year", progressLabel(e.hairLossProgress)],
                ["Areas", areasLabel(e.affectedAreas)],
                ["Family history", familyLabel(e.familyHistory)],
                ["Previous transplant", e.previousTransplant ? <span key="p">Yes{e.previousDetails ? <span className="mt-1 block whitespace-pre-wrap text-stone">{e.previousDetails}</span> : null}</span> : "No"],
                ["Notes from patient", e.historyNotes ? <span key="n" className="whitespace-pre-wrap">{e.historyNotes}</span> : "—"],
              ]}
            />
          </Card>

          <Card title="Quotation" id="quote">
            {e.quotes.length > 0 && (
              <ul className="mb-6 grid gap-3">
                {e.quotes.map((q) => (
                  <li key={q.id} className="rounded-xl border border-line p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium">
                        {formatMoney(q.amount, q.currency)} · {q.technique}
                        {q.graftsMin || q.graftsMax ? ` · ${q.graftsMin ?? "?"}–${q.graftsMax ?? "?"} grafts` : ""}
                      </p>
                      <Pill tone={q.status === "ACCEPTED" ? "good" : q.status === "DECLINED" || q.status === "EXPIRED" ? "bad" : q.status === "SENT" ? "warn" : "neutral"}>{q.status.toLowerCase()}</Pill>
                    </div>
                    {q.includes && <p className="mt-2 whitespace-pre-wrap text-stone">{q.includes}</p>}
                    <p className="mt-2 text-xs text-muted">
                      Created {fmtDate(q.createdAt)}
                      {q.sentAt ? ` · sent ${fmtDate(q.sentAt)}` : ""}
                      {q.validUntil ? ` · valid until ${fmtDate(q.validUntil)}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["SENT", "ACCEPTED", "DECLINED"] as const)
                        .filter((s) => s !== q.status)
                        .map((s) => (
                          <form key={s} action={setQuoteStatus}>
                            <input type="hidden" name="quoteId" value={q.id} />
                            <input type="hidden" name="status" value={s} />
                            <SubmitButton className={btnGhostCls}>Mark {s.toLowerCase()}</SubmitButton>
                          </form>
                        ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <form action={saveQuote} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="enquiryId" value={e.id} />
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="technique">
                  Recommended treatment
                </label>
                <input id="technique" name="technique" required placeholder="e.g. FUE — hairline & temples" className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="graftsMin">
                  Grafts from
                </label>
                <input id="graftsMin" name="graftsMin" inputMode="numeric" className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="graftsMax">
                  Grafts to
                </label>
                <input id="graftsMax" name="graftsMax" inputMode="numeric" className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="amount">
                  Price
                </label>
                <input id="amount" name="amount" required inputMode="decimal" placeholder="0.00" className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="currency">
                  Currency
                </label>
                <select id="currency" name="currency" className={inputCls}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="includes">
                  What&apos;s included
                </label>
                <textarea id="includes" name="includes" rows={3} className={inputCls} placeholder="Procedure, aftercare products, follow-up reviews…" />
              </div>
              <div>
                <label className={labelCls} htmlFor="validUntil">
                  Valid until
                </label>
                <input id="validUntil" name="validUntil" type="date" min={today()} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" name="markSent" className="size-4 accent-[var(--color-charcoal)]" /> Mark as sent to patient
              </label>
              <div className="sm:col-span-2">
                <SubmitButton>Save quotation</SubmitButton>
              </div>
            </form>
          </Card>

          <Card title="Appointment" id="appointment">
            {e.appointments.length > 0 && (
              <ul className="mb-6 grid gap-3">
                {e.appointments.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4 text-sm">
                    <div>
                      <p className="font-medium">{a.date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                      {a.notes && <p className="text-stone">{a.notes}</p>}
                      {a.confirmedAt && <p className="text-xs text-muted">Approved {fmtDate(a.confirmedAt, true)}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={a.status === "CONFIRMED" ? "good" : a.status === "CANCELLED" ? "bad" : a.status === "PROPOSED" ? "warn" : "neutral"}>{a.status.toLowerCase()}</Pill>
                      {(a.status === "PROPOSED" ? (["CONFIRMED", "CANCELLED"] as const) : a.status === "CONFIRMED" ? (["COMPLETED", "CANCELLED"] as const) : []).map((s) => (
                        <form key={s} action={setAppointmentStatus}>
                          <input type="hidden" name="appointmentId" value={a.id} />
                          <input type="hidden" name="status" value={s} />
                          <SubmitButton className={btnGhostCls}>{s === "CONFIRMED" ? "Approve & confirm" : s === "COMPLETED" ? "Mark completed" : "Cancel"}</SubmitButton>
                        </form>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mb-3 text-sm text-stone">
              Patient&apos;s preference: <strong className="text-charcoal">{preferredDateLabel(e.preferredDate)}</strong>
              {e.preferredDate !== "flexible" && ` (${flexLabel(e.dateFlexibility).toLowerCase()})`}
            </p>
            <form action={saveAppointment} className="grid gap-3 sm:grid-cols-[12rem_1fr]">
              <input type="hidden" name="enquiryId" value={e.id} />
              <div>
                <label className={labelCls} htmlFor="date">
                  Date
                </label>
                <input id="date" name="date" type="date" required min={today()} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="apptNotes">
                  Notes
                </label>
                <input id="apptNotes" name="notes" placeholder="Arrival time, location…" className={inputCls} />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="confirm" className="size-4 accent-[var(--color-charcoal)]" /> Approve and confirm now (otherwise saved as proposed)
              </label>
              <div className="sm:col-span-2">
                <SubmitButton>Save appointment</SubmitButton>
              </div>
            </form>
          </Card>

          <Card title="Deposit" id="deposit">
            {!paymentsEnabled() && <p className="mb-4 rounded-lg bg-sand px-3 py-2 text-xs text-stone">Online payments aren&apos;t switched on yet. Record deposits taken by bank transfer, card terminal or other methods here.</p>}
            {e.deposits.length > 0 && (
              <ul className="mb-6 grid gap-3">
                {e.deposits.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4 text-sm">
                    <div>
                      <p className="font-medium">
                        {formatMoney(d.amount, d.currency)}
                        {d.method ? ` · ${d.method}` : ""}
                      </p>
                      <p className="text-xs text-muted">
                        Requested {fmtDate(d.requestedAt)}
                        {d.paidAt ? ` · paid ${fmtDate(d.paidAt)}` : ""}
                        {d.providerRef ? ` · ref ${d.providerRef}` : ""}
                      </p>
                      {d.notes && <p className="text-stone">{d.notes}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={d.status === "PAID" ? "good" : d.status === "REFUNDED" ? "bad" : d.status === "REQUESTED" ? "warn" : "neutral"}>{d.status.toLowerCase()}</Pill>
                      {(d.status === "REQUESTED" ? (["PAID", "WAIVED"] as const) : d.status === "PAID" ? (["REFUNDED"] as const) : []).map((s) => (
                        <form key={s} action={setDepositStatus}>
                          <input type="hidden" name="depositId" value={d.id} />
                          <input type="hidden" name="status" value={s} />
                          <SubmitButton className={btnGhostCls}>Mark {s.toLowerCase()}</SubmitButton>
                        </form>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <form action={saveDeposit} className="grid gap-3 sm:grid-cols-3">
              <input type="hidden" name="enquiryId" value={e.id} />
              <div>
                <label className={labelCls} htmlFor="depAmount">
                  Amount
                </label>
                <input id="depAmount" name="amount" required inputMode="decimal" className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="depCurrency">
                  Currency
                </label>
                <select id="depCurrency" name="currency" className={inputCls}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="depStatus">
                  Status
                </label>
                <select id="depStatus" name="status" className={inputCls}>
                  <option value="REQUESTED">Requested</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="method">
                  Method
                </label>
                <input id="method" name="method" placeholder="Bank transfer" className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="providerRef">
                  Payment reference
                </label>
                <input id="providerRef" name="providerRef" className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="paidAt">
                  Paid on
                </label>
                <input id="paidAt" name="paidAt" type="date" className={inputCls} />
              </div>
              <div className="sm:col-span-3">
                <SubmitButton>Record deposit</SubmitButton>
              </div>
            </form>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card title="Contact">
            <DL
              rows={[
                ["Email", <a key="e" href={`mailto:${e.email}`} className="text-bronze underline-offset-2 hover:underline">{e.email}</a>],
                ["Phone", <a key="p" href={`tel:${e.phone.replace(/\s/g, "")}`}>{e.phone}</a>],
                ["Prefers", contactPref],
              ]}
            />
            {e.phoneIsWhatsApp && waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className={`${btnGhostCls} mt-4`}>
                Open WhatsApp chat
              </a>
            )}
          </Card>

          <Card title="Private notes">
            <form action={addNote} className="grid gap-2">
              <input type="hidden" name="enquiryId" value={e.id} />
              <label htmlFor="note" className="sr-only">
                Add a note
              </label>
              <textarea id="note" name="body" rows={3} required placeholder="Visible only to the clinical team…" className={inputCls} />
              <div>
                <SubmitButton>Add note</SubmitButton>
              </div>
            </form>
            <ul className="mt-5 grid gap-4">
              {e.notes.map((n) => (
                <li key={n.id} className="border-l-2 border-bronze-pale pl-3 text-sm">
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <p className="mt-1 text-xs text-muted">
                    {n.author?.name ?? "Former user"} · {fmtDate(n.createdAt, true)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Privacy & retention" id="privacy">
            <DL
              rows={[
                ["Health consent", fmtDate(e.healthConsentAt, true)],
                ["Consent wording", e.consentVersion],
                ["Marketing", e.marketingConsent ? "Opted in" : "No"],
                ["Auto-deletion", deletion ? fmtDate(deletion) : "On hold (kept)"],
              ]}
            />
            {isOwner && (
              <div className="mt-5 grid gap-3 border-t border-line pt-5">
                <form action={setRetentionHold}>
                  <input type="hidden" name="enquiryId" value={e.id} />
                  <input type="hidden" name="hold" value={e.retentionHold ? "false" : "true"} />
                  <SubmitButton className={btnGhostCls}>{e.retentionHold ? "Release retention hold" : "Keep (pause auto-deletion)"}</SubmitButton>
                </form>
                <a href={`/api/admin/enquiries/${e.id}/export`} className={btnGhostCls}>
                  Export patient data (JSON)
                </a>
                <details className="rounded-xl border border-danger/30 p-3 text-sm" open={!!deleteError}>
                  <summary className="cursor-pointer font-medium text-danger">Delete permanently</summary>
                  <p className="mt-2 text-xs leading-relaxed text-stone">
                    Erases this enquiry, all notes, quotes, appointments, deposits and the encrypted photographs. This cannot be undone. Type{" "}
                    <strong className="font-mono">{e.reference}</strong> to confirm.
                  </p>
                  <form action={deleteEnquiry} className="mt-3 grid gap-2">
                    <input type="hidden" name="enquiryId" value={e.id} />
                    <input name="confirm" required autoComplete="off" aria-label="Type the reference to confirm" className={inputCls} />
                    {deleteError && <p className="text-xs text-danger">The reference didn&apos;t match.</p>}
                    <SubmitButton className="rounded-full bg-danger px-4 py-2 text-sm font-medium text-ivory" pendingText="Deleting…">
                      Delete everything
                    </SubmitButton>
                  </form>
                </details>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
