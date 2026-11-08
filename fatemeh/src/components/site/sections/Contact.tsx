import { site, whatsappLink } from "@/content/site";
import { Placeholder } from "@/components/ui/Placeholder";
import { ArrowUpRight, WhatsApp } from "@/components/ui/icons";
import { ContactForm } from "../ContactForm";

export function ClinicDetails() {
  const c = site.contact;
  const row = "grid grid-cols-[6.5rem_1fr] gap-4 border-b border-line py-4 text-sm";
  return (
    <dl className="border-t border-line">
      <div className={row}>
        <dt className="text-muted">Address</dt>
        <dd>
          {c.addressLines ? (
            <>
              {c.addressLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
              {c.mapUrl && (
                <a href={c.mapUrl} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-bronze">
                  Directions <ArrowUpRight className="size-3.5" />
                </a>
              )}
            </>
          ) : (
            <Placeholder label="Clinic address & map link" />
          )}
        </dd>
      </div>
      <div className={row}>
        <dt className="text-muted">Phone</dt>
        <dd>{c.phone ? <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a> : <Placeholder label="Phone number" />}</dd>
      </div>
      <div className={row}>
        <dt className="text-muted">Email</dt>
        <dd>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <Placeholder label="Email address" />}</dd>
      </div>
      <div className={row}>
        <dt className="text-muted">Hours</dt>
        <dd>
          {c.hours ? (
            c.hours.map((h) => (
              <span key={h.days} className="flex justify-between gap-4">
                <span>{h.days}</span>
                <span className="text-stone">{h.time}</span>
              </span>
            ))
          ) : (
            <Placeholder label="Opening hours" />
          )}
        </dd>
      </div>
    </dl>
  );
}

export function WhatsAppCard() {
  return (
    <div id="whatsapp" className="on-dark rounded-[1.5rem] bg-charcoal p-8 text-on-dark md:p-10">
      <WhatsApp className="size-8 text-bronze-soft" />
      <p className="mt-6 font-display text-3xl leading-tight">Prefer to talk it through?</p>
      <p className="mt-3 leading-relaxed text-on-dark-muted">
        Message us on WhatsApp with general questions. For your privacy, please send photographs through the secure
        assessment rather than in chat.
      </p>
      <a
        href={whatsappLink()}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-3 text-sm font-medium text-charcoal transition hover:bg-white"
      >
        <WhatsApp className="size-4" /> Message on WhatsApp
      </a>
      {!site.contact.whatsapp && (
        <div className="mt-4">
          <Placeholder dark label="WhatsApp number" />
        </div>
      )}
    </div>
  );
}

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="py-24 md:py-36">
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <p data-reveal className="eyebrow">
            Contact
          </p>
          <h2 id="contact-title" data-reveal className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] text-balance">
            We&apos;re here to <em>answer questions.</em>
          </h2>
          <div data-reveal className="mt-10">
            <ClinicDetails />
          </div>
          <div data-reveal className="mt-10">
            <WhatsAppCard />
          </div>
        </div>
        <div data-reveal className="lg:col-span-7 lg:pt-4">
          <div className="rounded-[1.75rem] border border-line bg-ivory-raised/70 p-6 md:p-10">
            <p className="font-display text-3xl">Send a message</p>
            <p className="mb-8 mt-2 text-sm text-stone">For general questions. To be assessed, use the free hair assessment.</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
