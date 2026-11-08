# Fatemeh: Hair Restoration website

A premium hair-restoration website with a secure free-assessment system and a private dashboard.

- **Public site:** home, treatments (FUE, DHI, hairline, crown), before & after results, about, FAQ, contact, privacy.
- **Free hair assessment:** a 4-step form with 4 guided photo uploads, upload progress and previews.
- **Private dashboard** (`/admin`): enquiries, encrypted photos, status, private notes, quotations, appointment approval, deposit tracking, messages, access log, data export and deletion.

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the design and security decisions, and **[LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md)** for what must be supplied before going live.

> **Not deployed.** Nothing has been published. Deployment needs approval.

---

## Run it on your computer

You need **Node.js 20+** and a **PostgreSQL** database (local, or a free one from Neon / Supabase).

```bash
cd fatemeh
npm install
cp .env.example .env          # then fill in DATABASE_URL and ENCRYPTION_KEY
openssl rand -base64 32       # paste the output into ENCRYPTION_KEY
npm run db:migrate            # creates the tables
npm run admin:create -- --email you@example.com --name "Fatemeh" --owner
npm run dev                   # open http://localhost:3000
```

`admin:create` asks for a password, then shows a QR code. Scan it with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password). You'll need a code from it every time you sign in at `/admin`.

## Everyday tasks

| I want to… | Do this |
| --- | --- |
| Change clinic details (phone, address, WhatsApp, qualifications) | Edit `src/content/site.ts`. Anything left as `null` shows as a "To be supplied" placeholder. |
| Edit treatments / FAQ / reviews | `src/content/treatments.ts`, `faq.ts`, `testimonials.ts` |
| Add before & after photos | See below |
| Add a staff login | `npm run admin:create -- --email staff@clinic.com --name "Name"` |
| Reset a password or lost phone | `npm run admin:create -- --email person@clinic.com --reset` |
| Run the data clean-up by hand | `npm run retention:run` |

## Before & after photos

1. For each patient, create `content/results-source/<case-name>/` with `before.jpg`, `after.jpg` and a `case.json` (example at the top of `scripts/prepare-results.ts`).
2. Set `"consentConfirmed": true` **only** if you hold the patient's written consent for website use.
3. Optional: add progress photos (e.g. `3-months.jpg`, `6-months.jpg`) and list them under `"stages"` in `case.json`. They power the month-by-month timeline in the case studio and the featured scroll scene.
4. Run `npm run results:prepare`.

The first case is used as the *featured transformation* on the homepage. Use `"order"` in `case.json` to choose it.

Until real cases exist, the gallery shows **illustrated scalp diagrams** (labelled "Illustration") made by `npm run placeholders:make`. They are never presented as patient results.

The script crops all photos to the same 4:5 frame, makes them exactly the same size, removes hidden data (GPS location, phone model, dates) and updates the gallery. Placeholders disappear automatically once real cases exist.

**Use original photos. Don't AI-upscale them.** AI "upscalers" (including ChatGPT) redraw the image, which can add or sharpen hair. That makes a result misleading, which is a real risk under UK advertising rules for cosmetic procedures. Uploading patients' photos to a third-party AI tool is also a data-protection problem unless the patient agreed to it. The script never enlarges photos. If a photo is too small, it tells you to ask for the original.

## Deploying (when approved)

Recommended: **Vercel** (site) + **Neon or Supabase Postgres, EU/UK region** (database) + a **private S3 bucket in London** (`eu-west-2`) or Cloudflare R2 (photos) + **Resend** (email).

1. Create the database and bucket. Block **all** public access on the bucket.
2. In Vercel, set the project's root directory to `fatemeh`, then add every variable from `.env.example` (`STORAGE_DRIVER=s3`, `EMAIL_PROVIDER=resend`, a fresh `ENCRYPTION_KEY` and `CRON_SECRET`).
3. Run `npm run db:migrate` against the production database, then `npm run admin:create` for Fatemeh.
4. `vercel.json` already schedules the daily retention job.

**Back up `ENCRYPTION_KEY` somewhere safe** (a password manager). Without it, stored photos can't be decrypted.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
