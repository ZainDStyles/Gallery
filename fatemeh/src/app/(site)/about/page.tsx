import Image from "next/image";
import { site } from "@/content/site";
import { PageHeader } from "@/components/site/SectionHeading";
import { TeamGrid } from "@/components/site/sections/Trust";
import { Journey } from "@/components/site/sections/Journey";
import { AssessmentBand } from "@/components/site/sections/AssessmentBand";
import { Placeholder } from "@/components/ui/Placeholder";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Fatemeh & the Clinic",
  description: "Meet Fatemeh and the team behind a considered, assessment-first approach to hair restoration.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <PageHeader
        eyebrow="About"
        title={
          <>
            Considered care, <em>personally given.</em>
          </>
        }
      />
      <section className="container-site grid gap-14 pb-24 lg:grid-cols-12 lg:gap-20 md:pb-36">
        <div className="lg:col-span-5">
          <div data-reveal-image className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-sand">
            <Image src="/images/fatemeh/fatemeh-seated.jpg" alt="Fatemeh seated in the clinic" fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-[50%_20%]" />
          </div>
        </div>
        <div className="lg:col-span-7">
          <p data-reveal className="eyebrow">{site.clinician.fullName ?? site.clinician.name}</p>
          <div data-reveal className="mt-3">{site.clinician.role ? <p className="text-stone">{site.clinician.role}</p> : <Placeholder label="Professional title" />}</div>
          <div data-reveal className="prose-luxe mt-8 text-[1.05rem]">
            {site.clinician.bio ? (
              site.clinician.bio.split("\n\n").map((p) => <p key={p}>{p}</p>)
            ) : (
              <>
                <p>
                  Every assessment that comes through this website is reviewed personally by Fatemeh, who decides what to recommend,
                  and whether to recommend treatment at all.
                </p>
                <Placeholder block label="Biography: background, training, years of experience, why hair restoration (verified facts only)" />
              </>
            )}
          </div>
          <div data-reveal className="mt-12 grid gap-4 sm:grid-cols-2">
            {(site.qualifications.length ? site.qualifications : [null, null]).map((q, i) =>
              q ? (
                <div key={q.title} className="rounded-2xl border border-line bg-ivory-raised p-6">
                  <p className="font-medium">{q.title}</p>
                  <p className="mt-1 text-sm text-stone">{q.issuer}{q.year ? ` · ${q.year}` : ""}</p>
                </div>
              ) : (
                <div key={i} className="rounded-2xl border border-dashed border-line-strong p-6">
                  <p className="text-sm font-medium text-stone">Qualification</p>
                  <div className="mt-3"><Placeholder label="Title, institution, year & verification link" /></div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line py-24 md:py-36">
        <div className="container-site">
          <p data-reveal className="eyebrow">Medical team</p>
          <h2 data-reveal className="display mt-4 text-[clamp(2.2rem,4.4vw,3.8rem)]">
            The people <em>caring for you.</em>
          </h2>
          <TeamGrid />
        </div>
      </section>

      <section className="bg-sand/60 py-24 md:py-36">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p data-reveal className="eyebrow">The clinic</p>
            <h2 data-reveal className="display mt-4 text-[clamp(2.2rem,4.4vw,3.8rem)]">
              Where your <em>treatment</em> happens.
            </h2>
          </div>
          <div className="space-y-4 lg:col-span-7">
            <div data-reveal><Placeholder block label="Clinic location, facilities and regulator registration (with link to public register)" /></div>
            <div data-reveal><Placeholder block label="Photographs of the real clinic interior and treatment room" /></div>
          </div>
        </div>
      </section>

      <Journey />
      <AssessmentBand />
    </>
  );
}
