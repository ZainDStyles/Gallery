import { PageHeader } from "@/components/site/SectionHeading";
import { ClinicDetails, WhatsAppCard } from "@/components/site/sections/Contact";
import { ContactForm } from "@/components/site/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Questions about hair restoration? Message us on WhatsApp or send a message, or start with a free, private photo assessment.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            We&apos;re here to <em>answer questions.</em>
          </>
        }
        intro="For general questions, message us below or on WhatsApp. To be assessed, please use the free hair assessment so your photographs stay private."
      />
      <section className="container-site grid gap-14 pb-24 lg:grid-cols-12 lg:gap-20 md:pb-36">
        <div className="space-y-10 lg:col-span-5">
          <ClinicDetails />
          <WhatsAppCard />
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-[1.75rem] border border-line bg-ivory-raised/70 p-6 md:p-10">
            <p className="font-display text-3xl">Send a message</p>
            <p className="mb-8 mt-2 text-sm text-stone">We&apos;ll reply by email.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
