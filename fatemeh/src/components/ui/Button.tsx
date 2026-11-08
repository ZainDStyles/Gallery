import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "./icons";

type Variant = "primary" | "light" | "outline" | "outline-light" | "ghost";

const styles: Record<Variant, string> = {
  primary: "bg-charcoal text-ivory hover:bg-charcoal-soft",
  light: "bg-ivory text-charcoal hover:bg-white",
  outline: "border border-charcoal/25 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-ivory",
  "outline-light": "border border-on-dark/30 text-on-dark hover:border-on-dark hover:bg-on-dark hover:text-charcoal",
  ghost: "text-charcoal hover:text-bronze",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return [
    "group inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 text-[0.9rem] font-medium tracking-[0.01em]",
    "transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-luxe)] active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    styles[variant],
    extra,
  ].join(" ");
}

/** Arrow inside a small circle that nudges on hover. */
export function ArrowBadge({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`grid size-7 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-1 ${
        dark ? "bg-charcoal text-ivory" : "bg-bronze-soft/25 text-current"
      }`}
    >
      <ArrowRight className="size-3.5" />
    </span>
  );
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ variant = "primary", arrow = false, className = "", children, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, `${arrow ? "pr-2.5" : ""} ${className}`)} {...rest}>
      <span>{children}</span>
      {arrow && <ArrowBadge dark={variant === "light"} />}
    </Link>
  );
}
