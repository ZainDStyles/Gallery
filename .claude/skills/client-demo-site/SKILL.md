---
name: client-demo-site
description: Build a one-page demo website for a local business (barber, salon, tattoo studio, car detailing, garage, shisha lounge, DJ) that Zain can send as a link to win the client. Use when asked for a demo, template, concept site or a new client site from an existing template.
---

# Client demo site

## Start from what exists
Existing demos to copy from (never copy a client's real content into another client's site):
- Hair salon: `hairdresser-demo` repo (template repo) and `Gallery/salon/` (Atelier)
- Car detailing: `lacquer-detail` (scroll wash/polish/coat, booking panel)
- Car oil / garage: `Gallery/aurum-motor-oil/` (scroll-to-pour hero, shop, enquiry form)
- Barbers: `alex-barbers` (Next.js, real client: use as a pattern only)
- Tattoo: `inkwell-tattoo-studio` (Next.js, booking + deposits)
- Lounge / bar: `vivana-lounge` (Next.js, cinematic)
- Kitchen makeovers: `reface-website` (static, generated pages, Colour Studio)

## Default stack for a demo
- Plain HTML, CSS and JavaScript in one folder, no build step. Host free on GitHub Pages:
  put it in a new folder of the public `Gallery` repo → `https://zaindstyles.github.io/Gallery/<folder>/`.
- Paid client sites that need a database, admin or payments: Next.js on Vercel (see alex-barbers / inkwell).

## Must-haves
- Phone first (most visitors are on iPhones). Big readable text, 44px tap targets, sticky call/book button.
- One clear action: WhatsApp / call / book. WhatsApp links: `https://wa.me/<447...>?text=<encoded>`.
- Sections: hero, services (prices marked "example" until the owner gives real ones), gallery, reviews (real or a "Read our Google reviews" card), hours + map, contact.
- Forms: Web3Forms (free, key in config, no backend) or WhatsApp. Say plainly on the page if a form isn't connected yet.
- Placeholders for every unknown fact, visibly marked. A short "Demo: details are examples" line in the footer.
- `<meta name="robots" content="noindex">` while it's a demo.
- SEO basics for real launches: title, description, Open Graph image, LocalBusiness JSON-LD with real data only.

## Finish
- Run the `site-speed-check` skill.
- Screenshot phone (390x844) and desktop (1440x900) and look at them.
- Add the link to the Demo Links list (Figma "Demo links" page / Gallery README).
