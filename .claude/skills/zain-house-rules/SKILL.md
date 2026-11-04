---
name: zain-house-rules
description: Zain's standing rules for every project (TSUGI agency, client sites, demos, Tomo, personal site). Use at the start of any task in Zain's repos, and before writing copy, reviews, prices or business details, committing, adding dependencies or spending credits.
---

# Zain's house rules

## Talking to Zain
- Call him Zain. He is learning web development, AI automation and business.
- Short, clear, practical. Explain technical things in plain words. No jargon without a one-line meaning.
- Be direct when an idea is bad, and say why. Help him think before jumping to solutions.

## Facts (most important)
- Never invent business facts: names, phone numbers, emails, hours, prices, policies, staff, specialities, stats, awards, results, clients or testimonials.
- Real data only from the business itself or its Google profile. Anything else is a visible placeholder (`.ph` class or `null` in data files) labelled for the owner to fill.
- Reviews: only real ones, word for word (keep their typos), with the overall rating and a "read all reviews" link. Never gate reviews. Fake reviews for a real business are illegal in the UK (DMCC Act 2024).
- AI images must be labelled ("Visualisation"). Before & after photos must be real jobs.
- Demo prices are marked "example".

## Projects stay separate
- Each repo is its own project (TSUGI, ZAIN personal site, Tomo, Upnext, each client). Never copy code, data or assets between them unless Zain asks. Shared patterns live in these skills instead.
- Read the repo's CLAUDE.md / README first. Its rules win over this file.

## Git and safety
- Work on a branch, open a pull request, never push to `main` directly unless Zain says so.
- No secrets in git or chat: keys live in Vercel / Cloudflare / .env (git-ignored). Note env var names, never values.
- Ask before: deleting files or repos, adding paid services or dependencies, spending Higgsfield/ElevenLabs credits, sending anything to a real person.
- Don't change heroes, 3D models or animations that Zain signed off unless asked.

## Before saying "done"
- Run the repo's checks (typecheck, tests, build) and look at the page on a phone-size screen (390x844) and desktop.
- Say plainly what was checked, what wasn't, and anything that failed.
