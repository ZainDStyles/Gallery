# Fatemeh: architecture & visual direction

## 1. Reference analysis (drserkanaygin.com)

What we kept, as **structure** (no code, copy, branding or images were reused):

- A results gallery with treatment filters and case details.
- A guided, photo-based free consultation as the main conversion path.
- A clear step-by-step patient journey.
- WhatsApp as a first-class contact route.

What we deliberately did better:

| Reference | This site |
| --- | --- |
| Conflicting claims (years, patient counts, success rates differ between pages) | No figures at all until real, verifiable ones are supplied. Clearly labelled placeholders instead |
| Superlatives, price banners, "limited availability" pressure | Calm, editorial tone, with one primary call to action |
| About 50 navigation links | 6 links + one CTA |
| Separate before/after images, names and countries shown | Interactive comparison slider, a published photo standard, no identifying details |
| Form asks for health data before any privacy reassurance; no progress indicator | Progress bar, consent gate *before* photo upload, privacy explained at every step |
| Heavy GIFs, lots of placeholder SVGs | Static pages, optimised AVIF/WebP images, Lighthouse mobile ~90 |

## 2. Visual direction

**Feel:** a quiet, editorial luxury clinic. Think high-end skincare brand, not a medical tourism portal.

- **Palette:** warm ivory `#F6F1E9` backgrounds, deep charcoal `#1C1B19` type and dark sections, a restrained bronze `#8A5D33` (text-safe) / `#B88A5A` (on dark) accent. All text colours meet WCAG AA.
- **Type:** *Instrument Serif* for large editorial headlines, with italic bronze emphasis; *Hanken Grotesk* for body and UI text. Tracked uppercase eyebrows.
- **Layout:** generous whitespace, 12-column grid, large portrait photography, hairline dividers with a bronze tick.
- **Motion (GSAP + ScrollTrigger):** a curtain reveal on the hero photo with masked line-by-line headline, soft rise-in on scroll, image unmasking, gentle desktop-only parallax, and a scroll-drawn progress line on the journey. Only `transform`, `opacity` and `clip-path` are animated (smooth on iPhone). Everything is off under "reduce motion", and the page is fully readable without JavaScript.
- **Framer Motion** is used only where it earns its weight: the assessment form's step transitions. Elsewhere, CSS transitions keep the homepage bundle small.

## 3. Stack

Next.js 15 (App Router, React 19, TypeScript) · Tailwind CSS 4 · GSAP 3 · Framer Motion (`motion`) · PostgreSQL + Prisma 7 · sharp · Argon2id · TOTP 2FA · S3-compatible private storage.

## 4. How it fits together

```
Public pages (static HTML, fast)              Private dashboard (/admin, server-rendered per request)
 ├─ /  /treatments/*  /results  /about         ├─ login → 2FA → dashboard   (no public sign-up)
 ├─ /faq  /contact  /privacy                   ├─ enquiries list + detail
 └─ /assessment ──┐                            ├─ appointments, messages, access log, security
                  │                            └─ every page/action calls requireAdmin()
   1. tick consent → server action → one-time upload token
   2. each photo: resized in browser → XHR (progress bar) → /api/assessment/photos
        → decoded & re-encoded with sharp (metadata/GPS removed)
        → AES-256-GCM encrypted → private storage (random file names)
   3. submit → server action validates everything again (zod)
        → Enquiry row + unique reference (FA-XXXX-XXXX)
        → email to Fatemeh: reference + dashboard link ONLY
```

### Data model (prisma/schema.prisma)

`Enquiry` (patient details, hair history, consent record, retention clock) has many `Photo`, `EnquiryNote`, `Quote`, `Appointment`, `Deposit`. Plus `ContactMessage`, `AdminUser`, `AdminSession`, `AuditLog`, `UploadSession`, `RateLimit`.

## 5. Security & privacy model

| Requirement | How it's met |
| --- | --- |
| Photos never public | Stored outside `public/`, encrypted with AES-256-GCM (key bound to each file), random names. The only way out is `/api/admin/photos/[id]`, which requires a 2FA-verified session, decrypts on the fly and sends `no-store`. Next's image optimiser is never used for them (it would cache copies). |
| No sensitive data in email | Emails contain a reference and a link. No name, no health data, no photos. |
| Secure authentication | Argon2id passwords, mandatory TOTP 2FA (set up at account creation by CLI), DB-backed sessions in `__Host-` httpOnly, Secure, SameSite=Strict cookies, 12 h absolute / 2 h idle expiry, lockout after 5 failures, rate limits. |
| Restricted admin access | No sign-up route. Owner/staff roles: only the owner can export, delete or view the access log. Middleware + per-page + per-action checks. |
| Server-side validation | Every input validated with zod on the server (the browser copy is just for convenience). Server actions accept `unknown`. |
| Upload restrictions | Consent-gated one-time token, same-origin check, size limit, real image decoding (JPEG/PNG/WebP only), pixel limit, min resolution, 12 uploads per form, rate-limited per IP. |
| Explicit consent | Separate, unticked, specific consent for health data (UK GDPR Art. 9(2)(a)) before uploads unlock; versioned and timestamped. Marketing is a separate opt-in. |
| Retention & deletion | Daily job: abandoned uploads go after 24 h, enquiries after 12 months without activity (unless on hold), messages after 6 months, logs after 24 months. Owner can export (subject access request) or permanently delete (type the reference to confirm). |
| Accountability | Access log of sign-ins, views, photo views, changes, exports and deletions. References only, no patient details. IPs stored only as keyed hashes. |
| Headers | CSP (no eval, no framing, self-only), HSTS, nosniff, strict referrer, permissions policy, `noindex` + `no-store` on admin and API. |
| Bots | Honeypot field, minimum fill time, DB-backed rate limits. |

## 6. Payments (prepared, not active)

`Deposit` already has `provider` (MANUAL / STRIPE) and `providerRef`. `src/lib/payments.ts` documents the four steps to switch on Stripe Checkout. Until then, deposits are recorded by hand in the dashboard and `PAYMENTS_ENABLED=false`.
