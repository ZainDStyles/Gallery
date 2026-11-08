import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { StatusBadge } from "@/components/admin/ui";
import { fmtDate, preferredDateLabel, STATUS_LABEL } from "@/components/admin/labels";
import type { Prisma } from "@/generated/prisma/client";
import { EnquiryStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Enquiries" };

const OPEN: EnquiryStatus[] = ["NEW", "IN_REVIEW", "AWAITING_INFO", "QUOTED", "DEPOSIT_PENDING"];
const TABS = [
  { key: "open", label: "Open" },
  { key: "NEW", label: "New" },
  { key: "QUOTED", label: "Quoted" },
  { key: "DEPOSIT_PENDING", label: "Deposit pending" },
  { key: "BOOKED", label: "Booked" },
  { key: "COMPLETED", label: "Completed" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; deleted?: string; denied?: string }> }) {
  await requireAdmin();
  const { tab = "open", q = "", deleted, denied } = await searchParams;

  const where: Prisma.EnquiryWhereInput = {};
  if (tab === "open") where.status = { in: OPEN };
  else if (tab === "closed") where.status = { in: ["NOT_SUITABLE", "CLOSED"] };
  else if (tab in EnquiryStatus) where.status = tab as EnquiryStatus;
  const term = q.trim().slice(0, 80);
  if (term) {
    where.OR = [
      { reference: { contains: term, mode: "insensitive" } },
      { fullName: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { country: { contains: term, mode: "insensitive" } },
    ];
  }

  const [rows, counts] = await Promise.all([
    db().enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, reference: true, fullName: true, country: true, age: true, status: true, createdAt: true, preferredDate: true, _count: { select: { photos: true } } },
    }),
    db().enquiry.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const stats = [
    { label: "New", value: count("NEW") },
    { label: "In progress", value: count("IN_REVIEW") + count("AWAITING_INFO") + count("QUOTED") },
    { label: "Awaiting deposit", value: count("DEPOSIT_PENDING") },
    { label: "Booked", value: count("BOOKED") },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl">Enquiries</h1>
        <form className="w-full sm:w-72" role="search">
          <input type="hidden" name="tab" value={tab} />
          <input name="q" defaultValue={term} placeholder="Search reference, name, email…" aria-label="Search enquiries" className="w-full rounded-full border border-line-strong bg-ivory-raised px-4 py-2 text-sm focus:border-bronze focus:outline-none" />
        </form>
      </div>

      {deleted && <p className="mt-6 rounded-lg bg-[#dde9df] px-4 py-3 text-sm text-success">Enquiry {deleted} and its photographs were permanently deleted.</p>}
      {denied && <p className="mt-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">Only the account owner can do that.</p>}

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-ivory-raised p-4">
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-3xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Filter" className="no-scrollbar mt-8 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={{ pathname: "/admin", query: { tab: t.key, ...(term ? { q: term } : {}) } }}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm ${tab === t.key ? "border-charcoal font-medium" : "border-transparent text-stone hover:text-charcoal"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No enquiries {term ? `matching “${term}”` : `in “${TABS.find((t) => t.key === tab)?.label ?? STATUS_LABEL[tab] ?? tab}”`}.</p>
      ) : (
        <>
          {/* Table on larger screens */}
          <table className="mt-2 hidden w-full text-sm md:table">
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-3 pr-4 font-medium">Reference</th>
                <th className="py-3 pr-4 font-medium">Patient</th>
                <th className="py-3 pr-4 font-medium">Country</th>
                <th className="py-3 pr-4 font-medium">Preferred date</th>
                <th className="py-3 pr-4 font-medium">Received</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="group border-b border-line hover:bg-ivory-raised">
                  <td className="py-3.5 pr-4">
                    <Link href={`/admin/enquiries/${r.id}`} className="font-mono text-[0.8rem] tracking-wide text-bronze group-hover:underline">
                      {r.reference}
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Link href={`/admin/enquiries/${r.id}`} className="font-medium">
                      {r.fullName}
                    </Link>
                    <span className="text-muted"> · {r.age}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-stone">{r.country}</td>
                  <td className="py-3.5 pr-4 text-stone">{preferredDateLabel(r.preferredDate)}</td>
                  <td className="py-3.5 pr-4 text-stone">{fmtDate(r.createdAt)}</td>
                  <td className="py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Cards on phones */}
          <ul className="mt-4 grid gap-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/enquiries/${r.id}`} className="block rounded-2xl border border-line bg-ivory-raised p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs tracking-wide text-bronze">{r.reference}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-2 font-medium">{r.fullName}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {r.country} · received {fmtDate(r.createdAt)} · prefers {preferredDateLabel(r.preferredDate)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
