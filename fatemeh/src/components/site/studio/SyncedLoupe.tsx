"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ResultImage } from "@/content/results";

/**
 * Before and after side by side. Point (or press and drag on a phone) at any
 * spot and a magnifier shows that exact spot in BOTH photographs, so the
 * hairline can be inspected up close. Arrow keys move it; +/- change zoom.
 */
export function SyncedLoupe({ before, after, placeholder }: { before: ResultImage; after: ResultImage; placeholder: boolean }) {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(2.5);
  const [pinned, setPinned] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const grid = useRef<HTMLDivElement>(null);

  // Both frames are the same size; measure one so the magnifier maps exactly
  // onto the photo even where object-cover crops it.
  useEffect(() => {
    const el = grid.current?.firstElementChild as HTMLElement | null;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lens = (img: ResultImage) => {
    if (!pt || !box.w) return null;
    const L = box.w > 260 ? 160 : 120;
    const scale = Math.max(box.w / img.width, box.h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const ox = (box.w - dw) / 2;
    const oy = (box.h - dh) / 2;
    const u = (pt.x * box.w - ox) / dw;
    const v = (pt.y * box.h - oy) / dh;
    return {
      width: L,
      height: L,
      left: `${pt.x * 100}%`,
      top: `${pt.y * 100}%`,
      backgroundImage: `url(${img.src})`,
      backgroundSize: `${dw * zoom}px ${dh * zoom}px`,
      backgroundPosition: `${L / 2 - u * dw * zoom}px ${L / 2 - v * dh * zoom}px`,
      backgroundRepeat: "no-repeat",
      backgroundColor: "#1b1a17",
    } as React.CSSProperties;
  };

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPt({ x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) });
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.03;
    const cur = pt ?? { x: 0.5, y: 0.3 };
    const map: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (map[e.key]) {
      e.preventDefault();
      e.stopPropagation();
      setPt({ x: Math.min(1, Math.max(0, cur.x + map[e.key][0])), y: Math.min(1, Math.max(0, cur.y + map[e.key][1])) });
      setPinned(true);
    } else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(4, z + 0.5));
    else if (e.key === "-") setZoom((z) => Math.max(1.5, z - 0.5));
  };

  const frame = (img: ResultImage, label: string) => (
    <div
      className="relative h-full cursor-crosshair touch-none select-none overflow-hidden rounded-xl bg-[#1b1a17]"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => (e.pointerType === "mouse" || e.buttons) && move(e)}
      onPointerLeave={() => !pinned && setPt(null)}
      onPointerUp={(e) => e.pointerType !== "mouse" && !pinned && setPt(null)}
    >
      <Image src={img.src} alt={`${label}${placeholder ? " (illustration)" : ""}`} fill sizes="(min-width: 1024px) 34vw, 50vw" className="object-cover" draggable={false} />
      <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-[#141311]/70 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ivory backdrop-blur">
        {label}
      </span>
      {pt && box.w > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ivory/90 shadow-[0_10px_40px_rgb(0_0_0/0.5)]"
          style={lens(img) ?? undefined}
        />
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div
        tabIndex={0}
        role="group"
        aria-label="Side-by-side comparison with magnifier. Use arrow keys to move the magnifier, plus and minus to zoom."
        onKeyDown={onKey}
        ref={grid}
        className="grid min-h-0 flex-1 grid-cols-2 gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-soft md:gap-3"
      >
        {frame(before, "Before")}
        {frame(after, "After")}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-on-dark-muted">
        <p>{pt ? "Same spot, magnified in both photos" : "Point at any area to inspect it up close"}</p>
        <div className="flex items-center gap-1.5" role="group" aria-label="Magnifier zoom">
          {[2, 2.5, 3.5].map((z) => (
            <button
              key={z}
              type="button"
              aria-pressed={zoom === z}
              onClick={() => setZoom(z)}
              className={`min-h-9 min-w-11 rounded-full border px-3 transition ${zoom === z ? "border-on-dark bg-on-dark text-charcoal" : "border-on-dark/20 hover:border-on-dark/50"}`}
            >
              {z}×
            </button>
          ))}
          <button
            type="button"
            aria-pressed={pinned}
            onClick={() => {
              setPinned((v) => !v);
              setPt((p) => p ?? { x: 0.5, y: 0.25 });
            }}
            className={`min-h-9 rounded-full border px-3 transition ${pinned ? "border-bronze-soft text-bronze-soft" : "border-on-dark/20 hover:border-on-dark/50"}`}
          >
            {pinned ? "Unpin" : "Pin magnifier"}
          </button>
        </div>
      </div>
    </div>
  );
}
