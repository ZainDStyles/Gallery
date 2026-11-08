import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { Placeholder } from "@/components/ui/Placeholder";
import { ArrowUpRight, Shield } from "@/components/ui/icons";

const PRINCIPLES = [
  {
    title: "Assessed before anything is offered",
    body: "No one is quoted without their photographs and history being reviewed. If a transplant isn't right for you, you'll be told.",
  },
  {
    title: "Planned for the long term",
    body: "Your donor hair is finite. Plans take account of how your hair loss may progress, not just how you look next year.",
  },
  {
    title: "Private by design",
    body: "Your photographs are encrypted, stored privately, never emailed, and seen only by the clinical team.",
  },
];

export function Trust() {
  return (
    <section id="clinic" aria-labelledby="trust-title" className="py-24 md:py-36">
      <div className="container-site">
        {/* Introduction */}
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="relative lg:col-span-5">
            <div data-reveal-image className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-sand">
              <Image
                src="/images/fatemeh/fatemeh-portrait.jpg"
                alt="Portrait of Fatemeh in a white coat in the clinic"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[50%_25%]"
              />
            </div>
            <div data-reveal className="absolute -bottom-6 right-4 max-w-[15rem] rounded-2xl bg-ivory-raised p-5 shadow-[0_20px_60px_-20px_rgb(28_27_25/0.25)] md:-right-8">
              <p className="font-display text-2xl leading-none">{site.clinician.fullName ?? site.clinician.name}</p>
              <div className="mt-2 text-xs text-muted">{site.clinician.role ?? <Placeholder label="Professional title" />}</div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p data-reveal className="eyebrow">
              The clinic
            </p>
            <h2 id="trust-title" data-reveal className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] text-balance">
              One standard of care, from the <em>first photograph</em> to the final review.
            </h2>
            <div data-reveal className="prose-luxe mt-8 max-w-2xl text-[1.05rem]">
              {site.clinician.bio ? (
                <p>{site.clinician.bio}</p>
              ) : (
                <>
                  <p>
                    Every enquiry begins the same way: your photographs and history are reviewed personally by Fatemeh before any
                    recommendation is made. You&apos;ll get a clear explanation of what is realistic for your hair, and why.
                  </p>
                  <Placeholder block label="Fatemeh's biography, experience and clinic story — written from verified facts" />
                </>
              )}
            </div>

            <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title} data-reveal className="bg-ivory p-6">
                  <span className="font-display text-xl text-bronze">0{i + 1}</span>
                  <p className="mt-3 font-medium leading-snug">{p.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Credentials */}
        <div className="mt-28 grid gap-12 md:mt-36 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p data-reveal className="eyebrow">
              Verified credentials
            </p>
            <h3 data-reveal className="display mt-4 text-[clamp(2rem,3.6vw,3rem)]">
              Check us, <em>don&apos;t just trust us.</em>
            </h3>
            <p data-reveal className="mt-5 max-w-sm leading-relaxed text-stone">
              Every qualification and registration listed here links to a source you can check independently.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {site.qualifications.length > 0
              ? site.qualifications.map((q) => (
                  <div key={q.title} data-reveal className="rounded-2xl border border-line bg-ivory-raised p-6">
                    <Shield className="size-6 text-bronze" />
                    <p className="mt-4 font-medium">{q.title}</p>
                    <p className="mt-1 text-sm text-stone">
                      {q.issuer}
                      {q.year ? ` · ${q.year}` : ""}
                    </p>
                    {q.verifyUrl && (
                      <a href={q.verifyUrl} className="mt-4 inline-flex items-center gap-1 text-sm text-bronze" rel="noopener" target="_blank">
                        Verify <ArrowUpRight className="size-3.5" />
                      </a>
                    )}
                  </div>
                ))
              : ["Professional qualification", "Specialist training in hair restoration"].map((label) => (
                  <div key={label} data-reveal className="rounded-2xl border border-dashed border-line-strong p-6">
                    <Shield className="size-6 text-bronze/60" />
                    <p className="mt-4 font-medium text-stone">{label}</p>
                    <div className="mt-3">
                      <Placeholder label="Title, institution, year & verification link" />
                    </div>
                  </div>
                ))}

            <div data-reveal className="rounded-2xl border border-dashed border-line-strong p-6">
              <p className="text-sm font-medium text-stone">Regulator registration</p>
              <div className="mt-3">
                {site.regulator ? (
                  <a href={site.regulator.url} className="text-bronze" rel="noopener" target="_blank">
                    {site.regulator.name} · {site.regulator.id}
                  </a>
                ) : (
                  <Placeholder label="e.g. CQC / GMC / national equivalent, with public register link" />
                )}
              </div>
            </div>
            <div data-reveal className="rounded-2xl border border-dashed border-line-strong p-6">
              <p className="text-sm font-medium text-stone">Independent patient reviews</p>
              <div className="mt-3">
                <Placeholder label="Link to a verified review profile (e.g. Google, Trustpilot)" />
              </div>
              <Link href="/#stories" className="mt-4 inline-flex items-center gap-1 text-sm text-bronze">
                Patient stories <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mt-28 md:mt-36">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p data-reveal className="eyebrow">
                Medical team
              </p>
              <h3 data-reveal className="display mt-4 text-[clamp(2rem,3.6vw,3rem)]">
                The people <em>caring for you.</em>
              </h3>
            </div>
            <Link data-reveal href="/about" className="inline-flex items-center gap-2 border-b border-charcoal/30 pb-0.5 text-sm hover:border-bronze hover:text-bronze">
              About the clinic <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <TeamGrid />
        </div>
      </div>
    </section>
  );
}

export function TeamGrid() {
  const members = [
    { name: site.clinician.fullName ?? site.clinician.name, role: site.clinician.role, image: "/images/fatemeh/fatemeh-seated.jpg" },
    ...site.team.map((t) => ({ name: t.name, role: t.role as string | null, image: t.image ?? null })),
  ];
  const placeholders = Math.max(0, 3 - members.length);
  return (
    <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <li key={m.name} data-reveal>
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-sand">
            {m.image && (
              <Image
                src={m.image}
                alt={`${m.name}`}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover object-[50%_20%] transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]"
              />
            )}
          </div>
          <p className="mt-4 font-display text-2xl">{m.name}</p>
          <div className="mt-1 text-sm text-stone">{m.role ?? <Placeholder label="Professional title" />}</div>
        </li>
      ))}
      {Array.from({ length: placeholders }, (_, i) => (
        <li key={i} data-reveal>
          <div className="grid aspect-[16/7] place-items-center rounded-[1.5rem] border border-dashed border-line-strong bg-sand/40 sm:aspect-[4/5]">
            <span className="font-display text-6xl text-line-strong">·</span>
          </div>
          <p className="mt-4 font-display text-2xl text-muted">Team member</p>
          <div className="mt-1">
            <Placeholder label="Name, role & registration" />
          </div>
        </li>
      ))}
    </ul>
  );
}
