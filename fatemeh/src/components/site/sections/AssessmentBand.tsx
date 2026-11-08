import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { Camera, Check, Lock } from "@/components/ui/icons";

const POINTS = [
  { icon: Camera, text: "Four photos from your phone: front, top, crown and donor area" },
  { icon: Check, text: "A few questions about your hair-loss history" },
  { icon: Lock, text: "Encrypted on arrival, seen only by the clinical team" },
];

export function AssessmentBand() {
  return (
    <section aria-labelledby="assessment-band-title" className="on-dark relative overflow-hidden bg-charcoal text-on-dark">
      <div className="grid lg:grid-cols-12">
        <div className="relative h-[52svh] min-h-[22rem] overflow-hidden lg:col-span-5 lg:h-auto">
          <div data-parallax className="absolute -inset-y-[8%] inset-x-0">
            <Image
              src="/images/fatemeh/fatemeh-seated.jpg"
              alt="Fatemeh seated in the consultation room"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover object-[50%_25%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-charcoal/40" />
        </div>

        <div className="container-site relative py-20 lg:col-span-7 lg:max-w-none lg:px-20 lg:py-36">
          <p data-reveal className="eyebrow">
            Free hair assessment
          </p>
          <h2 id="assessment-band-title" data-reveal className="display mt-5 max-w-2xl text-[clamp(2.6rem,5.4vw,4.8rem)] text-balance">
            Know where you stand, <em>before you decide anything.</em>
          </h2>
          <ul className="mt-10 max-w-xl space-y-5">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} data-reveal className="flex items-start gap-4 text-on-dark-muted">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-on-dark/15 text-bronze-soft">
                  <Icon className="size-[1.1rem]" />
                </span>
                <span className="pt-2 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-12 flex flex-wrap items-center gap-5">
            <LinkButton href="/assessment" variant="light" arrow className="py-4 pl-7">
              Get Your Free Hair Assessment
            </LinkButton>
            <span className="text-sm text-on-dark-muted">No cost · No obligation</span>
          </div>
        </div>
      </div>
    </section>
  );
}
