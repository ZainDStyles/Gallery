import type { ReactNode } from "react";
import { STATUS_LABEL, STATUS_TONE } from "./labels";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${STATUS_TONE[status] ?? "bg-sand text-stone"}`}>
      {STATUS_LABEL[status] ?? status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const t = { neutral: "bg-sand text-stone", good: "bg-[#dde9df] text-success", warn: "bg-[#f3e6c8] text-[#7a5a12]", bad: "bg-danger/10 text-danger" }[tone];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${t}`}>{children}</span>;
}

export function Card({ title, children, action, id }: { title: string; children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-line bg-ivory-raised">
      <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DL({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-[minmax(6.5rem,9rem)_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="min-w-0 [overflow-wrap:anywhere]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export const inputCls = "w-full rounded-lg border border-line-strong bg-ivory px-3 py-2 text-sm focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/15";
export const labelCls = "mb-1 block text-xs font-medium text-stone";
export const btnCls = "inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-medium text-ivory transition hover:bg-charcoal-soft disabled:opacity-50";
export const btnGhostCls = "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-charcoal transition hover:border-charcoal";
