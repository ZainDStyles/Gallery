# Zain's Claude skills

Skills are short instruction files Claude loads when a task matches their description.
The same copy sits in `.claude/skills/` in every active project, so Claude Code finds them there.

| Skill | Use it when |
| --- | --- |
| `zain-house-rules` | Any work in Zain's projects (always relevant) |
| `client-demo-site` | Building a demo website to show a local business |
| `scroll-frame-hero` | A scroll-driven video hero (Aurum, Lacquer, Reface style) |
| `lead-research` | Finding businesses to contact and writing first messages |
| `site-speed-check` | Measuring and fixing how fast a site loads |

## Use them in new projects too
Copy the folders into your user skills folder once. Claude Code then loads them in every project on your PC, including new ones:

    Windows:  C:\Users\MouDy\.claude\skills\<skill-name>\SKILL.md

Account skills (docs, pdf, xlsx, pptx, ui-ux-pro-max, playwright, skill-creator...) are already on your Claude account
and load everywhere, so they are not copied here.

When you change a skill, change it in one project, then copy it to the others (or ask Claude to "sync the skills").
