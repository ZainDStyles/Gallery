import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  dark = false,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  id?: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p data-reveal className={`eyebrow ${dark ? "eyebrow-on-dark" : ""}`}>
        {eyebrow}
      </p>
      <h2 id={id} data-reveal className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] text-balance">
        {title}
      </h2>
      {intro && (
        <p data-reveal className={`mt-6 text-[1.05rem] leading-relaxed ${dark ? "text-on-dark-muted" : "text-stone"} ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}

/** Consistent header for inner pages (animates with CSS so there is no flash). */
export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <header className="container-site pb-14 pt-36 md:pb-20 md:pt-48">
      <div className="page-rise max-w-4xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-5 text-[clamp(2.8rem,7vw,5.8rem)] text-balance">{title}</h1>
        {intro && <p className="mt-7 max-w-2xl text-[1.05rem] leading-relaxed text-stone md:text-lg">{intro}</p>}
        <div className="rule mt-12" />
      </div>
    </header>
  );
}
