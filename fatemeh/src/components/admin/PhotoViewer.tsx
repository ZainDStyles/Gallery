"use client";

import { useEffect, useState } from "react";
import { Close } from "@/components/ui/icons";

type P = { id: string; slot: string; label: string };

/**
 * Thumbnails and full-size images load from the authenticated route only.
 * Plain <img> on purpose: Next's image optimiser would cache copies on disk.
 */
export function PhotoViewer({ photos }: { photos: P[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  if (!photos.length) return <p className="text-sm text-muted">No photographs.</p>;
  const current = open !== null ? photos[open] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button type="button" onClick={() => setOpen(i)} className="group block w-full text-left">
              <span className="block aspect-[4/3] overflow-hidden rounded-xl bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/admin/photos/${p.id}?size=thumb`} alt={p.label} loading="lazy" className="size-full object-cover transition group-hover:scale-[1.03]" />
              </span>
              <span className="mt-1.5 block text-xs text-stone">{p.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div role="dialog" aria-modal="true" aria-label={current.label} className="fixed inset-0 z-50 flex flex-col bg-charcoal/95 p-4 text-ivory" onClick={() => setOpen(null)}>
          <div className="flex items-center justify-between">
            <p className="text-sm">
              {current.label} <span className="text-on-dark-muted">· {open! + 1} of {photos.length} · access logged</span>
            </p>
            <button type="button" aria-label="Close" className="grid size-10 place-items-center rounded-full bg-ivory/10 text-xl" onClick={() => setOpen(null)}>
              <Close />
            </button>
          </div>
          <div className="mt-4 grid min-h-0 flex-1 place-items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current.id} src={`/api/admin/photos/${current.id}?size=full`} alt={current.label} className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
          <div className="mt-4 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
            {photos.map((p, i) => (
              <button key={p.id} type="button" onClick={() => setOpen(i)} className={`rounded-full px-3 py-1.5 text-xs ${i === open ? "bg-ivory text-charcoal" : "bg-ivory/10"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
