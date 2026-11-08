import Link from "next/link";
import { site } from "@/content/site";
import { PageHeader } from "@/components/site/SectionHeading";
import { Placeholder, PlaceholderNote } from "@/components/ui/Placeholder";
import { CONSENT_VERSION } from "@/lib/validation";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy & Cookies",
  description: "How your personal and health information, including assessment photographs, is collected, protected, kept and deleted.",
  path: "/privacy",
});

const retention = Number(process.env.RETENTION_MONTHS ?? 12);
const contactRetention = Number(process.env.CONTACT_RETENTION_MONTHS ?? 6);

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-10">
      <h2 className="font-display text-[1.9rem] leading-tight md:col-span-4">{title}</h2>
      <div className="prose-luxe space-y-4 md:col-span-8 [&_li]:text-stone [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy & cookies"
        title={
          <>
            Your information, <em>handled with care.</em>
          </>
        }
        intro="Hair assessment photographs and health details are sensitive. This notice explains plainly what we collect, why, how it's protected and how to have it deleted."
      />
      <div className="container-site pb-24 md:pb-36">
        <PlaceholderNote>
          Draft notice. It must be completed and checked by the business (the data controller), ideally with legal advice, before launch.
        </PlaceholderNote>

        <div className="mt-10">
          <Section id="who" title="Who we are">
            <p>
              The data controller is {site.legal.controllerName ?? <Placeholder label="Legal business name" />}, trading as {site.brand}{" "}
              {site.descriptor}.
            </p>
            <p>ICO registration: {site.legal.icoRegistration ?? <Placeholder label="ICO registration number" />}</p>
            <p>
              Contact for privacy questions:{" "}
              {site.contact.email ?? <Placeholder label="Privacy contact email" />}, or use the{" "}
              <Link href="/contact" className="underline underline-offset-2">contact form</Link> and choose &ldquo;Privacy or data request&rdquo;.
            </p>
          </Section>

          <Section id="what" title="What we collect">
            <p><strong className="text-charcoal">Free hair assessment:</strong></p>
            <ul>
              <li>Your name, age, email, phone or WhatsApp number, country and contact preference.</li>
              <li>Health information: your hair-loss history, areas affected, family history (optional) and any previous hair transplants.</li>
              <li>Four photographs of your scalp: front hairline, top, crown and donor area.</li>
              <li>Your preferred treatment timing and your consent choices.</li>
            </ul>
            <p><strong className="text-charcoal">Contact form:</strong> your name, email, optional phone number and message.</p>
            <p>
              We do not use analytics, advertising trackers or social media pixels. We don&apos;t keep your IP address. A scrambled,
              one-way code made from it is used briefly to stop spam and abuse.
            </p>
          </Section>

          <Section id="why" title="Why, and on what legal basis">
            <ul>
              <li>
                <strong className="text-charcoal">To assess your suitability and prepare a quotation</strong>: taking steps at your request
                before entering a contract (UK GDPR Article 6(1)(b)).
              </li>
              <li>
                <strong className="text-charcoal">Health information and photographs</strong> are &ldquo;special category&rdquo; data. We only
                process them with your <em>explicit consent</em> (Article 9(2)(a)), which you give on the photo step of the assessment. You
                can withdraw it at any time.
              </li>
              <li>
                <strong className="text-charcoal">Marketing</strong>: only if you separately opt in. You can opt out at any time.
              </li>
            </ul>
          </Section>

          <Section id="protect" title="How we protect it">
            <ul>
              <li>Photographs are encrypted (AES-256) the moment they reach our server and stored in private storage. They have no public web address.</li>
              <li>Location data and other hidden information embedded in phone photos is removed automatically.</li>
              <li>Only authorised clinical staff can view assessments, through a dashboard protected by a password and two-factor authentication. Every view is logged.</li>
              <li>Email notifications never contain your name, health details or photographs, only a reference number.</li>
              <li>Your photographs are never published or used for marketing. Before-and-after images on this website are only shown with separate, written consent.</li>
            </ul>
          </Section>

          <Section id="share" title="Who we share it with">
            <p>We don&apos;t sell or share your data for marketing. We use trusted service providers (processors) under contract to run this website:</p>
            <ul>
              <li>Website hosting: <Placeholder label="e.g. Vercel — region" /></li>
              <li>Database: <Placeholder label="provider & region" /></li>
              <li>Encrypted photo storage: <Placeholder label="provider & region (e.g. AWS London)" /></li>
              <li>Email delivery (reference-only notifications): <Placeholder label="provider" /></li>
            </ul>
            <p>
              International transfers: <Placeholder label="If any provider or the clinic is outside the UK, name the countries and safeguards (e.g. UK IDTA / adequacy)" />
            </p>
          </Section>

          <Section id="retention" title="How long we keep it">
            <ul>
              <li>Photos from an assessment that was started but never submitted: deleted automatically within 24 hours.</li>
              <li>
                Assessments: deleted automatically after {retention} months without activity, unless you go ahead with treatment, in which
                case relevant records are kept as required for medical records.
              </li>
              <li>Contact form messages: deleted after {contactRetention} months.</li>
            </ul>
          </Section>

          <Section id="rights" title="Your rights">
            <p>You can ask us to:</p>
            <ul>
              <li>give you a copy of your data, including your photographs;</li>
              <li>correct anything that&apos;s wrong;</li>
              <li>delete your data, or withdraw your consent, at any time;</li>
              <li>restrict or object to how we use it, or move it to another provider.</li>
            </ul>
            <p>
              Send your request, with your reference number if you have one, through the{" "}
              <Link href="/contact" className="underline underline-offset-2">contact form</Link> (&ldquo;Privacy or data request&rdquo;). We&apos;ll
              respond within one month. If you&apos;re unhappy with how we handle your data, you can complain to the{" "}
              <a href="https://ico.org.uk/make-a-complaint/" className="underline underline-offset-2" rel="noopener" target="_blank">
                Information Commissioner&apos;s Office
              </a>.
            </p>
          </Section>

          <Section id="cookies" title="Cookies">
            <p>
              The public website sets no cookies. A single, strictly necessary security cookie is used only when clinic staff sign in to
              the private dashboard. Because we use no analytics or advertising cookies, there is no cookie banner.
            </p>
          </Section>

          <p className="border-t border-line pt-8 text-xs text-muted">Consent wording version {CONSENT_VERSION}.</p>
        </div>
      </div>
    </>
  );
}
