import { FAQ } from "@/content/faq";
import { PageHeader } from "@/components/site/SectionHeading";
import { FaqList } from "@/components/site/FaqList";
import { AssessmentBand } from "@/components/site/sections/AssessmentBand";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Hair Transplant Questions & Answers",
  description: "Straight answers about FUE and DHI hair transplants: suitability, grafts, recovery, results, cost and how your data is protected.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd()} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])} />
      <PageHeader
        eyebrow="Questions"
        title={
          <>
            Good questions, <em>straight answers.</em>
          </>
        }
        intro="General information only. Your own assessment will answer these questions for your hair specifically."
      />
      <section className="container-site pb-24 md:pb-36">
        <div className="mx-auto max-w-4xl">
          <FaqList items={FAQ} />
        </div>
      </section>
      <AssessmentBand />
    </>
  );
}
