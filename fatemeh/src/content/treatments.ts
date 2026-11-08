/**
 * Treatments actually offered. Remove any that aren't.
 *
 * Copy is general, educational and deliberately free of success rates,
 * guarantees or superlatives. It must be reviewed by the treating clinician
 * before launch.
 */
export type Treatment = {
  slug: "fue" | "dhi" | "hairline-restoration" | "crown-restoration";
  name: string;
  short: string;
  kicker: string;
  summary: string;
  image: string;
  imageAlt: string;
  mayHelpWith: string[];
  process: { title: string; body: string }[];
  considerations: string[];
};

export const TREATMENTS: Treatment[] = [
  {
    slug: "fue",
    name: "FUE Hair Transplant",
    short: "FUE",
    kicker: "Follicular Unit Extraction",
    summary:
      "Individual follicular units are taken one by one from the donor area, usually the back and sides of the scalp, and placed into thinning areas. There is no linear strip scar.",
    image: "/images/fatemeh/fatemeh-clinic.jpg",
    imageAlt: "Fatemeh preparing instruments in the treatment room",
    mayHelpWith: [
      "Receding hairlines and temples",
      "Thinning across the top of the scalp",
      "Larger areas that need more grafts",
      "People who prefer to keep their hair short at the back",
    ],
    process: [
      { title: "Design", body: "The treatment area and hairline are planned and marked with you before anything begins." },
      { title: "Extraction", body: "Under local anaesthetic, follicular units are removed individually from the donor area using a fine punch." },
      { title: "Channels", body: "Tiny recipient sites are opened at angles and directions chosen to follow your natural hair growth." },
      { title: "Placement", body: "Grafts are placed into the prepared sites, then the area is cleaned and checked." },
    ],
    considerations: [
      "Your donor supply is finite, so the plan has to account for possible future hair loss.",
      "The donor area is usually shaved for extraction.",
      "Transplanted hair commonly sheds in the first weeks before regrowth begins.",
      "Results take many months to show and vary from person to person.",
    ],
  },
  {
    slug: "dhi",
    name: "DHI Hair Transplant",
    short: "DHI",
    kicker: "Direct Hair Implantation",
    summary:
      "Grafts are extracted in the same way as FUE, then implanted with a pen-like implanter that creates the site and places the graft in a single movement, allowing close control of angle and depth.",
    image: "/images/fatemeh/fatemeh-portrait.jpg",
    imageAlt: "Portrait of Fatemeh in a white coat in the clinic",
    mayHelpWith: [
      "Refining or densifying a defined area",
      "Hairline work that calls for precise angles",
      "In some cases, treatment without shaving the recipient area",
    ],
    process: [
      { title: "Design", body: "Hairline and density zones are planned with you and marked." },
      { title: "Extraction", body: "Under local anaesthetic, follicular units are extracted individually from the donor area." },
      { title: "Loading", body: "Each graft is loaded into an implanter pen sized to the graft." },
      { title: "Implantation", body: "The implanter creates the site and places the graft in one step, controlling direction and depth." },
    ],
    considerations: [
      "DHI is not automatically better than FUE. Which suits you depends on your hair, area and goals.",
      "Sessions can take longer for the same number of grafts.",
      "Shedding, then gradual regrowth over many months, is expected.",
      "Suitability is decided individually after assessment.",
    ],
  },
  {
    slug: "hairline-restoration",
    name: "Hairline Restoration",
    short: "Hairline",
    kicker: "Design-led frontal work",
    summary:
      "The hairline frames the face, so it is planned around your age, facial proportions, hair characteristics and how your hair loss may progress, rather than restoring a teenage hairline.",
    image: "/images/fatemeh/fatemeh-seated.jpg",
    imageAlt: "Fatemeh seated in the consultation room",
    mayHelpWith: ["Receding temples", "An uneven or high hairline", "Thinning at the front"],
    process: [
      { title: "Assessment", body: "Your photographs, hair calibre and donor area are reviewed to judge what is achievable." },
      { title: "Design", body: "A hairline is drawn with you, with a soft, irregular leading edge that looks lived-in rather than straight." },
      { title: "Grafting", body: "Finer single-hair grafts are usually placed at the very front, with denser grafts behind." },
      { title: "Review", body: "Growth is reviewed over the following months." },
    ],
    considerations: [
      "A hairline that is too low or too dense can look unnatural as you age.",
      "Future loss behind the transplanted area can change how the result looks over time.",
      "Your expectations are discussed openly at assessment.",
    ],
  },
  {
    slug: "crown-restoration",
    name: "Crown Restoration",
    short: "Crown",
    kicker: "Treating the vertex",
    summary:
      "The crown grows in a spiral, or whorl, and often needs a large number of grafts for visible coverage. Planning considers your donor supply and whether the frontal area should take priority.",
    image: "/images/fatemeh/fatemeh-clinic.jpg",
    imageAlt: "The treatment room with instruments prepared",
    mayHelpWith: ["Thinning at the crown", "A visible spot at the back of the head", "Combined front-and-crown plans"],
    process: [
      { title: "Assessment", body: "The size of the area, your donor supply and the likely progression of your hair loss are reviewed." },
      { title: "Planning", body: "We agree whether the crown is treated now, later or alongside the front." },
      { title: "Grafting", body: "Grafts are placed to recreate the natural whorl pattern." },
      { title: "Review", body: "Crown results often take longer to mature than frontal work." },
    ],
    considerations: [
      "Crown areas can keep widening, so a plan has to allow for change.",
      "Not everyone has enough donor hair to treat the front and crown fully.",
      "Medical treatments for hair loss may be discussed with an appropriate prescriber.",
    ],
  },
];

export const getTreatment = (slug: string) => TREATMENTS.find((t) => t.slug === slug);
