import Link from "next/link";
import { NAV, site, whatsappLink } from "@/content/site";
import { TREATMENTS } from "@/content/treatments";
import { Placeholder } from "@/components/ui/Placeholder";
import { ArrowUpRight, WhatsApp } from "@/components/ui/icons";

export function Footer() {
  const c = site.contact;
  return (
    <footer className="on-dark grain overflow-hidden bg-charcoal pb-[calc(6rem+env(safe-area-inset-bottom))] pt-20 text-on-dark md:pb-10 md:pt-28">
      <div className="container-site relative z-10">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow">Begin privately</p>
            <p className="display mt-5 max-w-md text-[2.6rem] md:text-[3.4rem]">
              Your hair, assessed <em>personally</em>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/assessment" className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-3 text-sm font-medium text-charcoal transition hover:bg-white">
                Free hair assessment <ArrowUpRight className="size-4" />
              </Link>
              <a href={whatsappLink()} className="inline-flex items-center gap-2 rounded-full border border-on-dark/25 px-5 py-3 text-sm transition hover:border-on-dark">
                <WhatsApp className="size-4" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm md:col-span-7 md:grid-cols-3">
            <div>
              <p className="eyebrow mb-5">Explore</p>
              <ul className="space-y-3">
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="text-on-dark-muted transition hover:text-on-dark">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-5">Treatments</p>
              <ul className="space-y-3">
                {TREATMENTS.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/treatments/${t.slug}`} className="text-on-dark-muted transition hover:text-on-dark">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="eyebrow mb-5">Clinic</p>
              <address className="space-y-3 not-italic text-on-dark-muted">
                {c.addressLines ? (
                  c.addressLines.map((l) => <p key={l}>{l}</p>)
                ) : (
                  <Placeholder dark label="Clinic address" />
                )}
                <p>{c.phone ?? <Placeholder dark label="Phone" />}</p>
                <p>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <Placeholder dark label="Email" />}</p>
              </address>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className="font-display mt-20 select-none whitespace-nowrap text-[23vw] leading-[0.8] tracking-[-0.03em] text-on-dark/[0.06] md:mt-28 md:text-[19vw]"
        >
          {site.brand}
        </p>

        <div className="mt-8 grid gap-6 border-t border-on-dark/10 pt-8 text-xs leading-relaxed text-on-dark-muted md:grid-cols-12">
          <p className="md:col-span-6">
            Information on this website is general and does not replace a personal consultation. Results vary from person to
            person. Hair transplantation is a surgical procedure with risks, which are explained before any treatment.
          </p>
          <div className="md:col-span-3">
            {site.regulator ? (
              <p>
                Registered with {site.regulator.name} · {site.regulator.id}
              </p>
            ) : (
              <Placeholder dark label="Regulator & registration number" />
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 md:col-span-3 md:justify-end">
            <Link href="/privacy" className="hover:text-on-dark">
              Privacy &amp; cookies
            </Link>
            <span>© {new Date().getFullYear()} {site.legal.controllerName ?? site.brand}</span>
            <a href={site.credit.url} className="hover:text-on-dark" rel="noopener">
              {site.credit.label}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
