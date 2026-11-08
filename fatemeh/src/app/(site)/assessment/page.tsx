import Image from "next/image";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { Camera, Lock, Person } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free Hair Assessment",
  description: "Send four photos and a few details for a free, private hair assessment reviewed personally by Fatemeh. Encrypted and never shared.",
  path: "/assessment",
});

const ASSURANCES = [
  { icon: Person, title: "Reviewed personally", body: "Fatemeh looks at every assessment herself." },
  { icon: Lock, title: "Private & encrypted", body: "Photos are encrypted on arrival and never published, shared or emailed." },
  { icon: Camera, title: "Four photos from your phone", body: "No special equipment needed. We'll guide you." },
];

export default function AssessmentPage() {
  return (
    <div className="container-site grid gap-14 pb-24 pt-28 md:pt-36 lg:grid-cols-12 lg:gap-16">
      <aside className="lg:col-span-4">
        <div className="page-rise lg:sticky lg:top-32">
          <p className="eyebrow">Free hair assessment</p>
          <h1 className="display mt-5 text-[clamp(2.6rem,5vw,4rem)] text-balance">
            Know where <em>you stand.</em>
          </h1>
          <p className="mt-5 leading-relaxed text-stone">A few minutes now, then a personal assessment and, if you&apos;re suitable, a written quotation. No cost and no obligation.</p>
          <ul className="mt-8 hidden space-y-5 lg:block">
            {ASSURANCES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-bronze">
                  <Icon className="size-[1.1rem]" />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="text-sm text-stone">{body}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-2xl bg-sand lg:block">
            <Image src="/images/fatemeh/fatemeh-portrait.jpg" alt="Fatemeh" fill sizes="30vw" className="object-cover object-[50%_22%]" />
          </div>
        </div>
      </aside>
      <section aria-label="Assessment form" className="lg:col-span-8">
        <div className="rounded-[1.75rem] border border-line bg-ivory-raised/60 p-5 sm:p-8 md:p-12">
          <AssessmentForm />
        </div>
      </section>
    </div>
  );
}
