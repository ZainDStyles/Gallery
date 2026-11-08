import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { setAppointmentStatus } from "@/app/actions/admin";
import { Pill, btnGhostCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { fmtDate } from "@/components/admin/labels";

export const metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  await requireAdmin();
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const [upcoming, past] = await Promise.all([
    db().appointment.findMany({
      where: { date: { gte: from }, status: { in: ["PROPOSED", "CONFIRMED"] } },
      orderBy: { date: "asc" },
      include: { enquiry: { select: { id: true, reference: true, fullName: true, country: true, deposits: { select: { status: true } } } } },
    }),
    db().appointment.findMany({
      where: { OR: [{ date: { lt: from } }, { status: { in: ["COMPLETED", "CANCELLED"] } }] },
      orderBy: { date: "desc" },
      take: 30,
      include: { enquiry: { select: { id: true, reference: true, fullName: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl">Appointments</h1>
      <p className="mt-2 text-sm text-stone">Proposed dates wait for your approval. Nothing is confirmed until you approve it.</p>

      <h2 className="mt-10 text-sm font-semibold">Upcoming</h2>
      {upcoming.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No upcoming appointments.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {upcoming.map((a) => {
            const paid = a.enquiry.deposits.some((d) => d.status === "PAID");
            return (
              <li key={a.id} className="grid gap-4 rounded-2xl border border-line bg-ivory-raised p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
                <div className="font-display text-2xl leading-tight">
                  {a.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  <span className="block text-xs font-sans text-muted">{a.date.toLocaleDateString("en-GB", { weekday: "long", year: "numeric" })}</span>
                </div>
                <div className="text-sm">
                  <Link href={`/admin/enquiries/${a.enquiry.id}#appointment`} className="font-medium hover:underline">
                    {a.enquiry.fullName}
                  </Link>
                  <span className="text-muted"> · {a.enquiry.reference} · {a.enquiry.country}</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <Pill tone={a.status === "CONFIRMED" ? "good" : "warn"}>{a.status === "CONFIRMED" ? "confirmed" : "awaiting approval"}</Pill>
                    <Pill tone={paid ? "good" : "neutral"}>{paid ? "deposit paid" : "no deposit recorded"}</Pill>
                  </div>
                  {a.notes && <p className="mt-1.5 text-stone">{a.notes}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(a.status === "PROPOSED" ? (["CONFIRMED", "CANCELLED"] as const) : (["COMPLETED", "CANCELLED"] as const)).map((s) => (
                    <form key={s} action={setAppointmentStatus}>
                      <input type="hidden" name="appointmentId" value={a.id} />
                      <input type="hidden" name="status" value={s} />
                      <SubmitButton className={btnGhostCls}>{s === "CONFIRMED" ? "Approve" : s === "COMPLETED" ? "Completed" : "Cancel"}</SubmitButton>
                    </form>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-12 text-sm font-semibold">Past &amp; cancelled</h2>
      <ul className="mt-3 divide-y divide-line text-sm">
        {past.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>
              {fmtDate(a.date)} ·{" "}
              <Link href={`/admin/enquiries/${a.enquiry.id}`} className="hover:underline">
                {a.enquiry.fullName}
              </Link>{" "}
              <span className="text-muted">{a.enquiry.reference}</span>
            </span>
            <Pill tone={a.status === "COMPLETED" ? "good" : a.status === "CANCELLED" ? "bad" : "neutral"}>{a.status.toLowerCase()}</Pill>
          </li>
        ))}
        {past.length === 0 && <li className="py-3 text-muted">Nothing yet.</li>}
      </ul>
    </div>
  );
}
