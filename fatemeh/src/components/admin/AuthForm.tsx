"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";

type Field = { name: string; label: string; type?: string; autoComplete?: string; inputMode?: "numeric" | "email" | "text"; pattern?: string; maxLength?: number };

export function AuthForm({
  action,
  fields,
  submit,
  autoFocusFirst = true,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  fields: Field[];
  submit: string;
  autoFocusFirst?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="grid gap-4">
      {fields.map((f, i) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="field-label">
            {f.label}
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            inputMode={f.inputMode}
            pattern={f.pattern}
            maxLength={f.maxLength}
            defaultValue={f.type === "password" ? undefined : state?.values?.[f.name]}
            required
            autoFocus={autoFocusFirst && (state?.values ? f.type === "password" : i === 0)}
            className="field"
          />
        </div>
      ))}
      {state?.error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-lg bg-[#dde9df] px-3 py-2 text-sm text-success">
          {state.ok}
        </p>
      )}
      <button type="submit" disabled={pending} className="mt-2 rounded-full bg-charcoal py-3.5 text-sm font-medium text-ivory transition hover:bg-charcoal-soft disabled:opacity-60">
        {pending ? "Please wait…" : submit}
      </button>
    </form>
  );
}
