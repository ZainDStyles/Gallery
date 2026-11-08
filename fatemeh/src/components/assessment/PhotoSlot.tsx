"use client";

import { useRef, useState } from "react";
import type { PhotoSlotName } from "@/lib/validation";
import { Camera, Check, Trash } from "@/components/ui/icons";

export type SlotState =
  | { status: "empty" }
  | { status: "preparing"; preview?: string }
  | { status: "uploading"; preview: string; progress: number }
  | { status: "securing"; preview: string }
  | { status: "done"; preview: string; id: string }
  | { status: "error"; preview?: string; message: string };

export const SLOT_INFO: Record<PhotoSlotName, { title: string; tip: string }> = {
  FRONT: { title: "Front hairline", tip: "Face the camera, hair pushed back, eyes level with the lens." },
  TOP: { title: "Top of head", tip: "Tilt your head forward and photograph from above." },
  CROWN: { title: "Crown", tip: "The back of the top of your head. Ask someone to help, or use a mirror." },
  DONOR: { title: "Donor area", tip: "The back and sides of your head, above the neck." },
};

/** Simple diagrams showing which area each photo should capture. */
function Guide({ slot }: { slot: PhotoSlotName }) {
  const head = "fill-none stroke-charcoal/35";
  const zone = "fill-bronze/25 stroke-bronze";
  return (
    <svg viewBox="0 0 80 80" className="size-14" aria-hidden>
      {slot === "FRONT" && (
        <>
          <ellipse cx="40" cy="42" rx="22" ry="28" className={head} strokeWidth="1.5" />
          <path d="M19 34c3-14 12-20 21-20s18 6 21 20c-7-5-14-7-21-7s-14 2-21 7Z" className={zone} strokeWidth="1.2" />
          <circle cx="32" cy="44" r="1.6" className="fill-charcoal/40" />
          <circle cx="48" cy="44" r="1.6" className="fill-charcoal/40" />
        </>
      )}
      {slot === "TOP" && (
        <>
          <ellipse cx="40" cy="40" rx="24" ry="29" className={head} strokeWidth="1.5" />
          <ellipse cx="40" cy="34" rx="15" ry="16" className={zone} strokeWidth="1.2" />
          <path d="M34 10l6-4 6 4" className="fill-none stroke-charcoal/40" strokeWidth="1.5" />
        </>
      )}
      {slot === "CROWN" && (
        <>
          <ellipse cx="40" cy="40" rx="24" ry="29" className={head} strokeWidth="1.5" />
          <circle cx="40" cy="52" r="11" className={zone} strokeWidth="1.2" />
          <path d="M34 10l6-4 6 4" className="fill-none stroke-charcoal/40" strokeWidth="1.5" />
        </>
      )}
      {slot === "DONOR" && (
        <>
          <ellipse cx="40" cy="40" rx="23" ry="28" className={head} strokeWidth="1.5" />
          <path d="M17.5 44c6 4 14 6 22.5 6s16.5-2 22.5-6c-1 10-6 18-12 22H30c-6-4-11-12-12.5-22Z" className={zone} strokeWidth="1.2" />
        </>
      )}
    </svg>
  );
}

export function PhotoSlot({
  slot,
  state,
  disabled,
  onFile,
  onRemove,
}: {
  slot: PhotoSlotName;
  state: SlotState;
  disabled: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const info = SLOT_INFO[slot];
  const preview = "preview" in state ? state.preview : undefined;
  const busy = state.status === "preparing" || state.status === "uploading" || state.status === "securing";
  const id = `photo-${slot.toLowerCase()}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-colors ${
        dragOver ? "border-bronze bg-bronze-pale/40" : state.status === "error" ? "border-danger/60" : state.status === "done" ? "border-charcoal/30" : "border-line-strong"
      } ${disabled ? "opacity-50" : ""} bg-ivory-raised`}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f && !disabled && !busy) onFile(f);
      }}
    >
      <div className="relative aspect-[4/3] bg-sand/50">
        {preview ? (
          // Local preview only (a blob: URL that never leaves this device).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`Your ${info.title.toLowerCase()} photo`} className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Guide slot={slot} />
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-charcoal/45 text-ivory backdrop-blur-[2px]">
            <div className="w-3/4 text-center text-sm">
              <p>{state.status === "preparing" ? "Preparing…" : state.status === "securing" ? "Encrypting…" : `Uploading ${Math.round((state.status === "uploading" ? state.progress : 0) * 100)}%`}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ivory/30" role="progressbar" aria-label={`${info.title} upload`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={state.status === "uploading" ? Math.round(state.progress * 100) : state.status === "securing" ? 100 : 0}>
                <div
                  className={`h-full rounded-full bg-ivory transition-[width] duration-200 ${state.status === "preparing" ? "w-1/6 animate-pulse" : ""}`}
                  style={state.status === "preparing" ? undefined : { width: `${state.status === "uploading" ? state.progress * 100 : 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {state.status === "done" && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-charcoal/80 px-2.5 py-1 text-xs text-ivory backdrop-blur">
            <Check className="size-3.5" /> Secured
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="font-medium">{info.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{info.tip}</p>
          {state.status === "error" && (
            <p role="alert" className="mt-2 text-xs text-danger">
              {state.message}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          {state.status === "done" && (
            <button type="button" onClick={onRemove} aria-label={`Remove ${info.title} photo`} className="grid size-10 place-items-center rounded-full border border-line-strong text-stone hover:border-danger hover:text-danger">
              <Trash className="size-4" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => input.current?.click()}
            className="flex h-10 items-center gap-2 rounded-full bg-charcoal px-4 text-sm text-ivory transition hover:bg-charcoal-soft disabled:opacity-50"
          >
            <Camera className="size-4" />
            {state.status === "done" || state.status === "error" ? "Replace" : "Add"}
          </button>
        </div>
      </div>

      <input
        ref={input}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Choose ${info.title} photo`}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
