# Atelier — salon website template

A one-page website for a hair salon: video hero, services, before & after slider,
team, reviews, opening hours and WhatsApp booking. Everything lives in `index.html`;
photos and videos live in `assets/`.

Live demo: https://zaindstyles.github.io/Gallery/salon/

## Re-branding it for a new salon

Work through this list in `index.html` (use Find to jump to each one).

1. **Salon name.** Replace every `Atelier`, including the `<title>`, the `og:` tags
   at the top and the big footer wordmark.
2. **Phone number.** Replace `07700 900123` / `07700900123` (it's a fake number
   reserved for TV and films).
3. **WhatsApp.** In the `SALON` settings near the bottom, set `whatsapp` to the
   salon's number in international format with no `+` or spaces (e.g. `447912345678`).
   Also replace `447700900123` in the WhatsApp links.
4. **Booking app instead of WhatsApp (optional).** If the salon uses Fresha,
   Booksy or similar, paste their booking link into `bookingUrl` in `SALON`.
   Every Book button will then go there.
5. **Opening hours, services and prices.** All in the `SALON` settings.
6. **Address.** Search for `14 Market Street` (appears in the Visit section and the
   directions link) and `Market Street` in the hero.
7. **Instagram.** Search for `instagram.com` and `@atelier.salon`.
8. **Team.** Names, roles and photos in the "Meet your stylists" section.
9. **Reviews.** The `REVIEWS` list holds **sample** reviews. Replace them with the
   salon's real Google reviews before it goes live. Publishing made-up reviews for a
   real business is illegal in the UK.
10. **Link preview.** Update `og:url` and `og:image` to the new web address, and
    replace `assets/og.jpg` (1200 × 630).
11. **Footer credit.** `Website by ZainDStyles`, so leave it in and link it to your site.

## Swapping photos and videos

Use the salon's real photos wherever possible. They sell far better than AI images.

- Drop new files into `assets/` with the same names (`svc-balayage.jpg`,
  `team-sophie.jpg`, `before-colour.jpg` and so on). Portrait 3:4 works best.
- Or list a download link in `assets/media.txt` and push. The "Fetch salon media"
  GitHub Action downloads it, shrinks it for the web and commits it for you.
  It skips files that already exist, so delete the old file first to replace one.
- Hero videos: one tall (9:16) and one wide (16:9) version of each clip, named
  `hero-1-tall.mp4`, `hero-1-wide.mp4` and so on. Keep each under about 1 MB.
