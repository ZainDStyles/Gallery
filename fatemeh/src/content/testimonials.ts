/**
 * PATIENT REVIEWS
 *
 * Every entry here is a PLACEHOLDER and renders with a visible
 * "Placeholder" label. Replace them only with genuine reviews from real
 * patients who have given written permission to be quoted, then set
 * `placeholder: false`. Publishing invented reviews is illegal in the UK
 * (Digital Markets, Competition and Consumers Act 2024).
 */
export type Testimonial = {
  quote: string;
  name: string;
  detail: string; // e.g. "FUE · 12 months after"
  source?: string; // e.g. "Google review" with a link
  sourceUrl?: string;
  placeholder: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "This space is reserved for a genuine patient story about their experience, from the first assessment to their result.",
    name: "Patient name or initials",
    detail: "Treatment · time since procedure",
    placeholder: true,
  },
  {
    quote: "A real review will appear here once a patient has agreed to share it. It might describe the consultation, the day itself or the months after.",
    name: "Patient name or initials",
    detail: "Treatment · time since procedure",
    placeholder: true,
  },
  {
    quote: "Placeholder for a verified review, ideally linked to its original source such as Google or Trustpilot so visitors can check it.",
    name: "Patient name or initials",
    detail: "Treatment · time since procedure",
    placeholder: true,
  },
];
