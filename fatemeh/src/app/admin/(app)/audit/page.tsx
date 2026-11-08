import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { fmtDate } from "@/components/admin/labels";

export const metadata = { title: "Access log" };

export default async function AuditPage() {
  await requireAdmin({ owner: true });
  const logs = await db().auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { actor: { select: { name: true } } } });
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl">Access log</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone">
        Every sign-in, view of patient data, photograph view, change, export and deletion is recorded here. Entries contain references, never
        patient details. Kept for {process.env.AUDIT_RETENTION_MONTHS ?? 24} months.
      </p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr className="border-b border-line">
              <th className="py-2.5 pr-4 font-medium">When</th>
              <th className="py-2.5 pr-4 font-medium">Who</th>
              <th className="py-2.5 pr-4 font-medium">Action</th>
              <th className="py-2.5 pr-4 font-medium">Reference</th>
              <th className="py-2.5 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-line">
                <td className="whitespace-nowrap py-2.5 pr-4 text-stone">{fmtDate(l.createdAt, true)}</td>
                <td className="py-2.5 pr-4">{l.actor?.name ?? (l.actorId ? "Deleted user" : "System / website")}</td>
                <td className="py-2.5 pr-4 font-mono text-xs">{l.action}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-bronze">{l.reference ?? "—"}</td>
                <td className="py-2.5 text-xs text-stone">{l.detail ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
