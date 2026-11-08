import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTreatment, TREATMENTS } from "@/content/treatments";
import { RESULTS } from "@/content/results";
import { FAQ } from "@/content/faq";
import { LinkButton } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/icons";
import { ResultsGallery } from "@/components/site/ResultsGallery";
import { FaqList } from "@/components/site/FaqList";
import { AssessmentBand } from "@/components/site/sections/AssessmentBand";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata, treatmentJsonLd } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => TREATMENTS.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTreatment((await params).slug);
  if (!t) return {};
  return pageMetadata({ title: `${t.name} (${t.kicker})`, description: t.summary, path: `/treatments/${t.slug}` });
}

const CATEGORY: Record<string, string> = { fue: "fue", dhi: "dhi", "hairline-restoration": "hairline", "crown-restoration": "crown" };

export default async function TreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTreatment((await params).slug);
  if (!t) notFound();
  const idx = TREATMENTS.indexOf(t);
  const next = TREATMENTS[(idx + 1) % TREATMENTS.length];
  const cases = RESULTS.filter((r) => r.categories.includes(CATEGORY[t.slug] as never)).slice(0, 3);
  const faq = FAQ.slice(0, 5);

  return (
    <>
      <JsonLd data={treatmentJsonLd(t)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Treatments", path: "/treatments" },
          { name: t.name, path: `/treatments/${t.slug}` },
        ])}
      />
      <header className="container-site grid gap-12 pb-20 pt-32 md:pt-44 lg:grid-cols-12 lg:items-end lg:gap-16">
        <div className="page-rise lg:col-span-7">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/treatments" className="hover:text-bronze">
              Treatments
            </Link>{" "}
            / <span className="text-charcoal">{t.short}</span>
          </nav>
          <p className="eyebrow mt-8">{t.kicker}</p>
          <h1 className="display mt-5 text-[clamp(2.8rem,7vw,5.8rem)] text-balance">{t.name}</h1>
          <p className="mt-7 max-w-2xl text-[1.05rem] leading-relaxed text-stone md:text-lg">{t.summary}</p>
          <div className="mt-9">
            <LinkButton href="/assessment" arrow>
              Am I suitable? Free assessment
            </LinkButton>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div data-reveal-image className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-sand">
            <Image src={t.image} alt={t.imageAlt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-[50%_25%]" />
          </div>
        </div>
      </header>

      <section className="border-t border-line py-20 md:py-28">
        <div className="container-site grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p data-reveal className="eyebrow">May help with</p>
            <ul className="mt-6 space-y-3">
              {t.mayHelpWith.map((m) => (
                <li key={m} data-reveal className="flex gap-3 border-b border-line pb-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-bronze" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8">
            <p data-reveal className="eyebrow">How it works</p>
            <ol className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              {t.process.map((p, i) => (
                <li key={p.title} data-reveal className="bg-ivory p-7">
                  <span className="font-display text-lg text-bronze">0{i + 1}</span>
                  <p className="mt-3 font-display text-2xl">{p.title}</p>
                  <p className="mt-2 leading-relaxed text-stone">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-sand/60 py-20 md:py-28">
        <div className="container-site grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p data-reveal className="eyebrow">Good to know</p>
            <h2 data-reveal className="display mt-4 text-[clamp(2rem,4vw,3.2rem)]">
              Honest <em>considerations.</em>
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {t.considerations.map((c) => (
              <li key={c} data-reveal className="rounded-2xl bg-ivory p-6 leading-relaxed text-stone">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {cases.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-site">
            <p data-reveal className="eyebrow">Results</p>
            <h2 data-reveal className="display mb-10 mt-4 text-[clamp(2rem,4vw,3.2rem)]">
              {t.short} <em>results</em>
            </h2>
            <ResultsGallery cases={cases} />
          </div>
        </section>
      )}

      <section className="border-t border-line py-20 md:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p data-reveal className="eyebrow">Questions</p>
            <h2 data-reveal className="display mt-4 text-[clamp(2rem,4vw,3.2rem)]">
              Before you <em>decide.</em>
            </h2>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faq} />
          </div>
        </div>
      </section>

      <AssessmentBand />

      <Link href={`/treatments/${next.slug}`} className="group block border-b border-line bg-ivory py-14 md:py-20">
        <div className="container-site flex items-center justify-between gap-6">
          <span>
            <span className="eyebrow">Next treatment</span>
            <span className="mt-3 block font-display text-[clamp(2.2rem,5vw,4rem)] leading-none transition-colors group-hover:text-bronze">{next.name}</span>
          </span>
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-charcoal/20 transition-all duration-500 group-hover:bg-charcoal group-hover:text-ivory">
            <ArrowRight className="size-5" />
          </span>
        </div>
      </Link>
    </>
  );
}
