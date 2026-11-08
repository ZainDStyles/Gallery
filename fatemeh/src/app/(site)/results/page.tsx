import { RESULTS, HAS_REAL_RESULTS } from "@/content/results";
import { PageHeader } from "@/components/site/SectionHeading";
import { ResultsGallery } from "@/components/site/ResultsGallery";
import { PHOTO_STANDARDS } from "@/components/site/sections/ResultsPreview";
import { AssessmentBand } from "@/components/site/sections/AssessmentBand";
import { PlaceholderNote } from "@/components/ui/Placeholder";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Before & After Results",
  description: "Unretouched before and after photographs of FUE, DHI, hairline and crown restoration, shown with patient consent.",
  path: "/results",
});

export default function ResultsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Results", path: "/results" }])} />
      <PageHeader
        eyebrow="Before & after"
        title={
          <>
            Results, shown <em>exactly as they are.</em>
          </>
        }
        intro="Drag across each photograph to compare before and after. Filter by treatment to see cases like yours."
      />
      <section className="container-site pb-24 md:pb-36">
        <div className="mb-12 grid gap-6 rounded-2xl border border-line bg-ivory-raised/70 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="font-medium">Our photography standards</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone">
              {PHOTO_STANDARDS.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-bronze" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-muted">Results vary from person to person. These cases don&apos;t guarantee a similar outcome.</p>
        </div>
        {!HAS_REAL_RESULTS && <PlaceholderNote>These cards demonstrate the gallery. Authentic, consented patient results will replace them.</PlaceholderNote>}
        <div className="mt-8">
          <ResultsGallery cases={RESULTS} />
        </div>
      </section>
      <AssessmentBand />
    </>
  );
}
