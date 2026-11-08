import type { Metadata } from "next";
import { site } from "@/content/site";
import { FAQ } from "@/content/faq";
import type { Treatment } from "@/content/treatments";

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}

/**
 * Structured data only ever includes facts that have been supplied in
 * content/site.ts. Placeholders are left out, never published as data.
 */
export function clinicJsonLd() {
  const c = site.contact;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `${site.url}/#clinic`,
    name: `${site.brand} ${site.descriptor}`,
    url: site.url,
    image: `${site.url}/images/fatemeh/fatemeh-portrait.jpg`,
    description: site.defaultDescription,
    availableService: [
      { "@type": "MedicalProcedure", name: "FUE hair transplant", procedureType: "https://schema.org/SurgicalProcedure" },
      { "@type": "MedicalProcedure", name: "DHI hair transplant", procedureType: "https://schema.org/SurgicalProcedure" },
    ],
  };
  if (c.phone) data.telephone = c.phone;
  if (c.email) data.email = c.email;
  if (c.addressLines && c.city && c.country) {
    data.address = { "@type": "PostalAddress", streetAddress: c.addressLines.join(", "), addressLocality: c.city, addressCountry: c.country };
  }
  const sameAs = Object.values(site.social).filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

export function faqJsonLd(items = FAQ) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function treatmentJsonLd(t: Treatment) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: t.name,
    alternateName: t.kicker,
    description: t.summary,
    procedureType: "https://schema.org/SurgicalProcedure",
    bodyLocation: "Scalp",
    url: `${site.url}/treatments/${t.slug}`,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}
