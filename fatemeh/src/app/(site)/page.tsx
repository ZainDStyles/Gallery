import dynamic from "next/dynamic";
import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { Trust } from "@/components/site/sections/Trust";
import { ResultsPreview } from "@/components/site/sections/ResultsPreview";
import { TreatmentList } from "@/components/site/sections/Treatments";
import { Journey } from "@/components/site/sections/Journey";
// Split into its own chunk so it hydrates separately from the rest of the page.
const ProcedureScene = dynamic(() => import("@/components/site/procedure/ProcedureScene").then((m) => m.ProcedureScene));
import { AssessmentBand } from "@/components/site/sections/AssessmentBand";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { Contact } from "@/components/site/sections/Contact";
import { SectionHeading } from "@/components/site/SectionHeading";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { ArrowUpRight } from "@/components/ui/icons";
import { FAQ } from "@/content/faq";
import { clinicJsonLd, faqJsonLd } from "@/lib/seo";

export default function HomePage() {
  const homeFaq = FAQ.filter((f) => f.home);
  return (
    <>
      <JsonLd data={clinicJsonLd()} />
      <JsonLd data={faqJsonLd(homeFaq)} />
      <Hero />
      <Trust />
      <ResultsPreview />

      <section id="treatments" aria-labelledby="treatments-title" className="py-24 md:py-36">
        <div className="container-site">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-8 md:mb-20">
            <SectionHeading
              id="treatments-title"
              eyebrow="Treatments"
              title={
                <>
                  Four treatments, <em>one approach.</em>
                </>
              }
              intro="Every plan starts from the same question: what is right for your hair, now and in ten years' time?"
            />
          </div>
          <TreatmentList />
        </div>
      </section>

      <ProcedureScene />
      <Journey />
      <AssessmentBand />
      <Testimonials />

      <section id="faq" aria-labelledby="faq-title" className="bg-sand/60 py-24 md:py-36">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-4">
            <SectionHeading
              id="faq-title"
              eyebrow="Questions"
              title={
                <>
                  Good questions, <em>straight answers.</em>
                </>
              }
            />
            <Link data-reveal href="/faq" className="mt-8 inline-flex items-center gap-2 border-b border-charcoal/30 pb-0.5 text-sm hover:border-bronze hover:text-bronze">
              All questions <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={homeFaq} />
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}
