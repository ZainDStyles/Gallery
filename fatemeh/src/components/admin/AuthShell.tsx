import { Lock } from "@/components/ui/icons";

export function AuthShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-3xl">Fatemeh</span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-bronze">Dashboard</span>
        </p>
        <h1 className="mt-10 font-display text-[2.4rem] leading-tight">{title}</h1>
        {intro && <p className="mt-2 text-sm leading-relaxed text-stone">{intro}</p>}
        <div className="mt-8">{children}</div>
        <p className="mt-10 flex items-center gap-2 text-xs text-muted">
          <Lock className="size-3.5" /> Restricted access. All activity is logged.
        </p>
      </div>
    </main>
  );
}
