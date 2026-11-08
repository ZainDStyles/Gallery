import { PageHeader } from "@/components/site/SectionHeading";
import { TreatmentList } from "@/components/site/sections/Treatments";
import { AssessmentBand } from "@/components/site/sections/AssessmentBand";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Hair Transplant Treatments: FUE, DHI, Hairline & Crown",
  description: "FUE and DHI hair transplants, hairline restoration and crown restoration, each planned individually after a free photo assessment.",
  path: "/treatments",
});

export default function TreatmentsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Treatments", path: "/treatments" }])} />
      <PageHeader
        eyebrow="Treatments"
        title={
          <>
            Chosen for <em>your</em> hair, not from a menu.
          </>
        }
        intro="The right technique depends on your hair loss pattern, donor supply, hair characteristics and goals. Your assessment comes first; the recommendation follows."
      />
      <section className="container-site pb-24 md:pb-36">
        <TreatmentList />
      </section>
      <AssessmentBand />
    </>
  );
}
