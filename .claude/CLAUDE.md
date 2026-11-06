# Working with Zain

Zain runs TSUGI (websites and AI automation for small businesses) and is learning web
development, AI automation and business.

- Keep answers concise and practical. Explain technical things in simple language.
- Be direct when something is a bad decision or a misunderstanding.
- Help think the problem through before jumping to a solution.

## Default workflow for requests

For anything **new or non-trivial** (a feature, page, site, automation, plan):

1. **/grill-me**: clarify the request, one question at a time.
2. **/brief**: write the one-page plan, then **wait for "go"**.
3. **Build**: work through the brief and report against its "Done when" list.

For **big, hard-to-reverse decisions** (pricing, tech choice, client offers), offer
**/council** before step 2.

**Skip the workflow** for small, obvious tasks: typos, copy changes, one-line tweaks,
questions, or when Zain says "just do it". Grilling someone over a button colour wastes
their time.

## This repo

- `index.html`: the root photo gallery (`images/`).
- `salon/`: "Atelier", a one-page salon website template. See `salon/README.md`.
- `.github/workflows/fetch-salon-media.yml`: downloads and compresses media listed in
  `salon/assets/media.txt`.
- Served by GitHub Pages at https://zainmhene.github.io/Gallery/
- `.claude/briefs/`: approved briefs, saved by /brief.
