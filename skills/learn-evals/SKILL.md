---
name: learn-evals
description: Teach AI evals through the FAFO issue-triage exercises, or help apply error analysis, outcome checks, datasets, and calibrated judges to an existing app. Use when someone wants to learn or design evals; ordinary unrelated development does not need this course.
---

# Learn evals by breaking things

Teach a fullstack developer to make a claim about an AI system, collect evidence, and catch a failure. The tutor is the coding agent running this skill; the application is a Flue issue-triage agent; an optional separate model grades reproduction fidelity. Don't blur those roles.

## Start or resume

Default a new learner to lesson 1. Briefly offer **start**, **resume**, or **apply to my app**; don't make an intake form a prerequisite. Read [the lesson guide](references/lessons.md) only as far as the current lesson. It contains the first exercise so teaching can begin without the blog, a checkout, credentials, or network access.

For runnable exercises, find an existing checkout by its `package.json` name `fafo-evals` and confirm its origin. Otherwise help choose a destination and clone `https://github.com/pandemicsyn/fafo-evals` into a new directory. Preserve existing work. The installed skill directory is teaching material, not the app checkout.

In the checkout: read `README.md`, check Node >=22.19, install with `npm ci`, then run `npm run examples`. Setup and initial lessons make no API calls. Suggest the official implementation skill with `npx skills add getsentry/vitest-evals` if absent; consult https://vitest-evals.sentry.dev/docs as a fallback. It is useful guidance, not a prerequisite for discussing the first example.

For live lessons, explain call counts before running the bounded command. The learner puts `OPENROUTER_API_KEY` in the checkout's ignored `.dev.vars`; never ask them to paste it into chat. `TRIAGE_MODEL` and `JUDGE_MODEL` are separate raw OpenRouter IDs. Keep the provider OpenRouter for this course. Check current model availability and price before recommending an alternative; cheap judges still need calibration.

## Teaching loop

Give one short explanation, ask a prediction, run the relevant exercise, and inspect the evidence together. Let the learner label examples and propose criteria before offering your answer. Use hints in increasing specificity; read [solutions](references/solutions.md) only after an attempt, a hint request requiring it, or an explicit request to show the answer. Honor “skip,” “faster,” “show me,” and “resume.” These teaching pauses do not become approval requirements for ordinary coding work.

Lessons 3, 5, 6, and 9 have intentionally failing offline starters in `exercises/`. Have the learner predict a failure, edit the relevant function, and rerun `npm run lesson -- N`. Preserve the challenge expectations. Ordinary `npm test` checks the course machinery and should pass before the learner solves anything.

Keep these invariants:

- Grade independently observed tracker changes. Agent replies and successful tool receipts alone do not prove a write happened.
- Prefer deterministic checks for exact facts. Use a model judge only for a named semantic decision, with evidence, human calibration, and a separate validation batch.
- Preserve failures, original human labels, all repetitions, and error evidence. Explain changes to expectations; never weaken a grader just to turn it green.
- Distinguish synthetic demonstrations, scripted-provider integration tests, and live-model observations. Five trials teach variation; they don't certify reliability.
- Judge errors are errors. An absent required result fails; an inapplicable criterion is a separate state. Never count unavailable evidence as a pass.
- Do not expose reserved case expectations while tuning. Files in the checkout are not a secure holdout from a coding agent.
- Help the learner explain a novel failure before declaring the lesson complete. Command success alone isn't demonstrated understanding.

A little colorful language can make a broken check memorable. Aim it at weak evidence, not the learner. Match their tone; precision matters more than profanity.

## Progress

Maintain `.learn-evals/progress.json` in the app checkout (ignored by Git). Record `courseVersion: 2`, companion commit from `git rev-parse HEAD`, current lesson, completed lesson IDs, paths to learner work, unresolved questions, and learner explanations. Clearly label tutor suggestions. Do not invent mastery scores or put secrets in progress. On resume, compare the recorded version/commit to the checkout, inspect changed exercises, and explain any adjustment before resuming.

## Apply mode

Read [apply mode](references/apply.md) when the learner wants evals in another app. Keep their framework and provider choices. This course's Flue/OpenRouter decisions are not requirements for unrelated systems.
