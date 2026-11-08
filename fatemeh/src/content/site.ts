/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CLINIC DETAILS — the one place to edit facts about the business.
 *
 *  Anything set to `null` shows on the website as a clearly labelled
 *  placeholder ("To be supplied") and is left out of search-engine data.
 *  Only fill these in with real, verifiable information.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const site = {
  brand: "Fatemeh",
  descriptor: "Hair Restoration",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  defaultDescription:
    "Considered hair restoration — FUE, DHI, hairline and crown restoration — beginning with a free, private photo assessment reviewed personally by Fatemeh.",

  clinician: {
    name: "Fatemeh",
    fullName: null as string | null, // e.g. "Fatemeh Surname"
    role: null as string | null, // exact professional title, e.g. as registered with the regulator
    bio: null as string | null,
  },

  /** Each entry must be real and checkable. Leave empty to show placeholders. */
  qualifications: [] as { title: string; issuer: string; year?: string; verifyUrl?: string }[],

  /** e.g. { name: "Care Quality Commission", id: "1-234567890", url: "https://www.cqc.org.uk/location/..." } */
  regulator: null as { name: string; id: string; url?: string } | null,

  /** Other team members. Leave empty to show placeholder cards. */
  team: [] as { name: string; role: string; image?: string }[],

  contact: {
    whatsapp: null as string | null, // international format, digits only, e.g. "447700900123"
    phone: null as string | null, // display format, e.g. "+44 20 0000 0000"
    email: null as string | null,
    addressLines: null as string[] | null,
    city: null as string | null,
    country: null as string | null,
    hours: null as { days: string; time: string }[] | null,
    mapUrl: null as string | null, // a Google / Apple Maps link (we don't embed maps: no tracking cookies)
  },

  social: {
    instagram: null as string | null,
    tiktok: null as string | null,
    youtube: null as string | null,
  },

  /** Data controller details for the privacy notice. */
  legal: {
    controllerName: null as string | null, // legal name of the business
    icoRegistration: null as string | null, // UK ICO registration number
    companyNumber: null as string | null,
  },

  credit: { label: "Website by TSUGI", url: "https://tsugidigital.com" },
} as const;

export const whatsappLink = (message = "Hello, I'd like to ask about hair restoration.") =>
  site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}` : "/contact#whatsapp";

export const NAV = [
  { href: "/treatments", label: "Treatments" },
  { href: "/results", label: "Results" },
  { href: "/about", label: "About" },
  { href: "/#journey", label: "Your journey" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;
