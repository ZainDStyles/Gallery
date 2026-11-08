# Launch checklist

Everything below shows on the site as a dashed **"To be supplied"** or **"Placeholder"** label until it's filled in. Only use real, verifiable information.

## Facts about the clinic: `src/content/site.ts`

- [ ] Fatemeh's full name and exact professional title (as registered)
- [ ] Biography (verified facts only)
- [ ] Qualifications: title, institution, year, link to verify
- [ ] Regulator registration (e.g. CQC / GMC / national equivalent) with public register link
- [ ] Team members: name, role, registration, photo
- [ ] Clinic address, city, country, map link, opening hours
- [ ] Phone, email, **WhatsApp number**
- [ ] Social links
- [ ] Legal business name, ICO registration number, company number

## Content

- [ ] Clinician to review all treatment and FAQ wording (`src/content/treatments.ts`, `faq.ts`)
- [ ] Remove any treatment not actually offered
- [ ] Real patient reviews with written permission, ideally linked to Google/Trustpilot (`src/content/testimonials.ts`)
- [ ] Before & after cases with written consent, original unretouched photos (`npm run results:prepare`). These replace the illustrated diagrams automatically
- [ ] Ideally, progress photos (3, 6, 12 months) for at least the featured case, for the timeline
- [ ] Real photographs of the clinic interior
- [ ] Hero video (optional)

## Legal & privacy

- [ ] Privacy notice (`/privacy`) completed and checked, ideally by a legal adviser
- [ ] Name the actual processors and regions (hosting, database, storage, email)
- [ ] If the clinic or any provider is outside the UK: document international transfers
- [ ] Data Protection Impact Assessment (DPIA). Recommended for health data at scale
- [ ] Deposit / cancellation terms written up before any deposit is taken
- [ ] Patient consent form for publishing before & after photos

## Technical (at deployment)

- [ ] Production database (EU/UK region) and private storage bucket (public access blocked)
- [ ] Fresh `ENCRYPTION_KEY`, backed up securely
- [ ] `CRON_SECRET`, `NOTIFY_EMAIL`, email provider with a verified sending domain
- [ ] Owner account created with 2FA
- [ ] Domain set in `APP_URL` / `NEXT_PUBLIC_SITE_URL`
- [ ] Submit a test assessment end to end on a real iPhone
