"use client";

import { useFormStatus } from "react-dom";
import { btnCls } from "./ui";

export function SubmitButton({ children, className = btnCls, pendingText = "Saving…" }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
