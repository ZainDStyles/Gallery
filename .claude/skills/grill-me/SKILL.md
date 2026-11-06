---
name: grill-me
description: Interview the user one question at a time about a request, plan or idea until the goal, scope and "done" are clear, before any building starts. Use when the user says "grill me", types /grill-me, or asks for something new and non-trivial (a feature, page, site, automation, business plan) where the details are still fuzzy.
argument-hint: "[what you want to build or decide]"
---

# Grill me

Your job is to find the gaps in Zain's request **before** any work happens. A wrong
assumption caught now costs one message; caught after building, it costs a rebuild.

## How to run it

1. **Restate the request in one sentence** so Zain can catch a misread straight away.
2. **Check the repo and context first.** If a question can be answered by reading the
   code, files or earlier messages, look it up instead of asking.
3. **Ask one question at a time.** Never send a list of questions.
4. **Give your recommended answer with every question**, plus one line on why, so Zain
   can just reply "yes". Example:
   > **Q3: Who books, the salon owner or their customers?**
   > My pick: customers, through WhatsApp, because the salon already uses it and it's free.
5. **Follow the decision tree in order.** Settle the decisions that others depend on
   first:
   - **Goal:** what problem this solves, and for whom
   - **User:** who uses it, and on what device
   - **Scope:** what's in, and what's explicitly *not* in this version
   - **Constraints:** deadline, budget, tools or stack, things that must not break
   - **Done:** how we'll know it works (something we can actually check)
   - **Risks:** what's most likely to go wrong
6. **Push back on weak answers.** If an answer is vague ("make it look good"), contradicts
   an earlier answer, or is a bad idea, say so plainly and explain why in simple terms.
   Don't just accept it and move on.
7. **Explain any jargon** the first time you use it, in one short sentence.

## Rules

- Only ask questions whose answer **changes what gets built**. No filler.
- Match the depth to the task: about 3 questions for a small change, up to about 10
  for a new project. Stop as soon as there's nothing left that would change the plan.
- If Zain says "skip", "just do it", or "you decide", use your recommended answers
  and say which ones you assumed.

## Finish

When nothing important is left, post a short summary:

```
## What we agreed
- Goal: ...
- For: ...
- In scope: ...
- Not in scope: ...
- Done when: ...
- Assumptions I made: ...
```

Then ask: **"Want me to turn this into a /brief?"**
