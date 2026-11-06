---
name: council
description: Convene a council of 4–5 advisors with different viewpoints (skeptic, customer, builder, business operator, and others) who each assess a decision independently, then synthesise one clear recommendation. Use when the user types /council, asks for a council, multiple perspectives, a second opinion or a devil's advocate, or faces a big, hard-to-reverse decision (pricing, tech stack, hiring, launching, a client offer). If the user didn't ask for one, offer it rather than running it, because it costs more.
argument-hint: "[the decision or question]"
---

# Council

One opinion has blind spots. The council gives Zain several independent views on a
decision, shows where they genuinely disagree, and ends with **one** clear call.

## 1. Frame the question

Write the question as a decision with options, not a vague topic:

- Weak: "Thoughts on pricing?"
- Strong: "Should TSUGI charge salons £500 one-off or £49/month for a website?"

Gather the context the advisors need: goal, budget, timeline, who's affected, and any
relevant files or earlier messages. If the decision itself is unclear, ask Zain one
question to pin it down first (with your recommended framing).

## 2. Pick the members

Choose the **4–5 most relevant** advisors. If Zain names specific members
("/council with an accountant"), use those.

| Member | Asks |
|---|---|
| **Skeptic** | How does this fail? What's being ignored? Argues against by default. |
| **Customer** | Would the end user actually want, notice or pay for this? |
| **Client** | How does the business owner paying for it (e.g. a salon) see it? |
| **Builder** | Is it feasible, how long will it take, and what's the simplest version? What will it cost to maintain? |
| **Operator** | Money, time, ROI, opportunity cost. Is this the best use of the next week? |
| **Designer** | Is it clear and usable, and does it fit the brand? |
| **Marketer** | How will people find it, and will it convert? |
| **Mentor** | Is this a good learning step for Zain, or a detour? |
| **Lawyer** | Legal or compliance risk (consumer law, GDPR, fake reviews, contracts). |

The Skeptic is always on the council.

## 3. Hear each member independently

Each member must answer **without seeing the others' answers**, so they don't anchor
on each other.

- **If the Agent tool is available:** spawn one subagent per member **in a single
  message so they run in parallel**. Give each the same framed question and context,
  plus its role. Use this prompt:

  > You are the **<Role>** on an advisory council. <One-line role description from the
  > table.> The decision: <question>. Context: <context>.
  > Reply in under 150 words, in plain language:
  > **Verdict:** for / against / only if ..., in one line.
  > **Reasons:** your 2–3 strongest points.
  > **Biggest risk:** one line.
  > **I'd want to know:** the one fact that would change your mind.
  > Give your real view from your role. Don't hedge and don't try to be balanced.
  > Disagreeing is your job.

- **If there's no Agent tool:** write each member's answer in turn, fully committing to
  that role before moving to the next. Don't soften one view to match another.

## 4. Chair's verdict

You are the chair. Weigh the arguments; don't just count votes or average them.
Output this, and keep the whole thing scannable:

```markdown
## Council: <question>

| Member | Verdict | Key point |
|---|---|---|
| Skeptic | Against | ... |
| ... | ... | ... |

**Where they agree:** ...

**The real disagreement:** the core tension, in 1–2 lines.

**Verdict:** <clear recommendation>. Confidence: low / medium / high.
**Why:** 2–3 lines.

**What would change this:** ...

**Next step:** one concrete action.
```

## Rules

- No fence-sitting. The chair makes a call even when it's close, and says so.
- Plain language. Explain any jargon in one short line.
- If the council exposes that Zain is about to make a bad decision, say it directly.
- If the decision leads to building something, offer **/brief** as the next step.
