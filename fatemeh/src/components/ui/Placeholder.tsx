/**
 * A clearly visible marker for information that must come from the clinic.
 * It's intentionally obvious so nothing invented slips into the live site.
 */
export function Placeholder({ label, dark = false, block = false }: { label: string; dark?: boolean; block?: boolean }) {
  return (
    <span
      className={`${block ? "flex" : "inline-flex"} items-center gap-2 rounded-md border border-dashed px-2 py-1 align-middle text-[0.7rem] font-medium tracking-wide ${
        dark ? "border-bronze-soft/60 text-bronze-soft" : "border-bronze/50 bg-bronze-pale/40 text-bronze"
      }`}
    >
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] opacity-80">To be supplied</span>
      <span>{label}</span>
    </span>
  );
}

export function PlaceholderNote({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`mt-3 inline-flex items-center gap-2 rounded-md border border-dashed px-2.5 py-1.5 text-xs ${
        dark ? "border-bronze-soft/50 text-bronze-soft" : "border-bronze/40 bg-bronze-pale/30 text-bronze"
      }`}
    >
      <span className="font-semibold uppercase tracking-[0.16em] text-[0.6rem]">Placeholder</span>
      {children}
    </p>
  );
}
