"use client";

import type { ReactNode } from "react";
import { Check } from "@/components/ui/icons";

export function Field({ id, label, hint, error, children, optional }: { id: string; label: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export const invalid = (id: string, error?: string) => ({
  id,
  "aria-invalid": !!error,
  "aria-describedby": error ? `${id}-error` : undefined,
});

type Option = { value: string; label: string };

/** Radio or checkbox group drawn as chips, built on native inputs (keyboard and screen-reader friendly). */
export function Chips({
  name,
  legend,
  options,
  value,
  onChange,
  multiple = false,
  error,
  optional,
  columns = "auto",
}: {
  name: string;
  legend: string;
  options: readonly Option[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
  error?: string;
  optional?: boolean;
  columns?: "auto" | "2";
}) {
  const selected = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="field-label">
        {legend} {optional && <span className="font-normal text-muted">(optional)</span>}
        {multiple && <span className="font-normal text-muted"> · choose all that apply</span>}
      </legend>
      <div className={columns === "2" ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"}>
        {options.map((o) => {
          const on = selected(o.value);
          return (
            <label
              key={o.value}
              className={`relative flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[0.92rem] transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-bronze has-[:focus-visible]:ring-offset-2 ${
                on ? "border-charcoal bg-charcoal text-ivory" : "border-line-strong bg-ivory-raised hover:border-charcoal/50"
              }`}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={o.value}
                checked={on}
                onChange={() => {
                  if (multiple) {
                    const arr = Array.isArray(value) ? value : [];
                    onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value]);
                  } else onChange(o.value);
                }}
                className="sr-only"
              />
              {multiple && (
                <span className={`grid size-4 place-items-center rounded-[0.3rem] border ${on ? "border-ivory bg-ivory text-charcoal" : "border-line-strong"}`}>
                  {on && <Check className="size-3" strokeWidth={2.5} />}
                </span>
              )}
              {o.label}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function Checkbox({ id, checked, onChange, children, error }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: ReactNode; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[0.92rem] leading-relaxed text-stone">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-charcoal)]"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="field-error pl-8">
          {error}
        </p>
      )}
    </div>
  );
}
