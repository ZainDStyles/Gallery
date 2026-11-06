---
name: brief
description: Turn a request (ideally after /grill-me) into a one-page brief covering the goal, scope, plan and a "done when" checklist, then wait for the user's go-ahead before building. Use when the user types /brief, asks for a brief, spec or plan, or after a /grill-me session wraps up.
argument-hint: "[optional: topic, if not already discussed]"
---

# Brief

A brief is the agreement on what gets built, written down before the work starts.
It should fit on one screen. If it doesn't, the task is too big: split it.

## Before writing

- If /grill-me already ran, build the brief from what was agreed there.
- If it didn't, and the goal, scope or "done" are unclear, ask the 1–3 questions that
  matter most (one at a time, with your recommended answer) or suggest a quick /grill-me.
  Don't invent requirements to fill gaps. List them under **Open questions** instead.
- Look at the relevant files in the repo so the plan points at real files, not guesses.

## Format

Use this structure, in plain language, with no padding:

```markdown
# Brief: <short name>
_Date: YYYY-MM-DD_

**Goal:** One sentence. What we're making and why it matters.

**For:** Who uses it, and on what (phone, desktop, etc.).

**In scope**
- ...

**Not in scope (this time)**
- ...

**Decisions**
- <decision>: <why, in one line>

**Plan**
1. <step>, touching `path/to/file`
2. ...

**Done when**
- [ ] <something we can check, e.g. "Booking button opens WhatsApp on iPhone">
- [ ] ...

**Risks / open questions**
- ...
```

## Rules

- **Done when** items must be checkable. "Looks nice" is not checkable.
  "Hero loads in under 2s on 4G" is.
- Keep the plan to the fewest steps that get to done. Flag anything that's
  over-engineered for what Zain actually needs.
- If something in the brief is a bad idea (too costly, too slow, a legal risk like fake
  reviews), say so directly in **Risks**.

## After writing

1. Show the brief in chat.
2. End with: **"Reply 'go' to build, or tell me what to change."**
3. **Don't start building until Zain approves.**
4. Once approved, save it to `.claude/briefs/YYYY-MM-DD-<short-name>.md` and commit it
   together with the work, so later sessions can see what was agreed. Cloud sessions
   are wiped, so anything not committed is lost.
5. While building, tick off the **Done when** list and report against it at the end.
