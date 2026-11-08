import { RESULTS } from "@/content/results";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "../SectionHeading";
import { ResultsGallery } from "../ResultsGallery";

export const PHOTO_STANDARDS = [
  "Published only with the patient's written consent",
  "Unretouched: no filters, no AI enhancement",
  "Matching angle, distance and lighting",
];

export function ResultsPreview() {
  return (
    <section id="results" aria-labelledby="results-title" className="on-dark grain bg-charcoal py-24 text-on-dark md:py-36">
      <div className="container-site relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <SectionHeading
            dark
            id="results-title"
            eyebrow="Before & after"
            title={
              <>
                Results, shown <em>honestly.</em>
              </>
            }
            intro="Drag across each photograph to compare. Every case is shown exactly as photographed, with the treatment and timeframe alongside."
          />
          <ul data-reveal className="space-y-2.5 text-sm text-on-dark-muted">
            {PHOTO_STANDARDS.map((s) => (
              <li key={s} className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-bronze-soft" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="mt-14">
          <ResultsGallery cases={RESULTS} limit={3} dark />
        </div>

        <div data-reveal className="mt-14 flex justify-center">
          <LinkButton href="/results" variant="light" arrow>
            View all results
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
