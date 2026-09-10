# Apply the workflow to an existing app

Inspect the real entrypoint and a few recent failures/traces. Ask what user outcome should have occurred and what authoritative evidence can establish it. Preserve the app's framework and provider choices.

1. Write a small failure taxonomy from observations. Start with the last expensive or confusing failure, not a generic benchmark.
2. Choose the execution boundary: a pure function, tool layer, model loop, or HTTP app. Explain what that boundary excludes.
3. Author a few unambiguous cases and valid alternatives. Keep expected results out of model inputs. Reset sessions and mutable state per independent trial.
4. Start with exact graders where possible. Challenge each with a known bad result and a valid alternative. Add narrow semantic graders only when code cannot make the decision meaningfully.
5. Calibrate judges against human-labeled outputs and validate on separate examples. Preserve disagreements and errors; don't grade the judge using its own labels.
6. Retain run identities, revisions, settings, evidence, repetitions and costs. Keep deterministic CI distinct from live-model spending and production monitoring.
7. Interpret per-case and behavior-slice changes. Preserve failed attempts, avoid cherry-picking, and explain where more representative data or human review is needed.

Consult the installed official vitest-evals skill or current primary documentation for API mechanics if that tool fits. The transferable lesson is the evidence loop, not the Flue fixture schema. Don't force vitest-evals onto a Python app just because this course used TypeScript.

Useful sources: [Anthropic's agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [Hamel and Shreya's FAQ](https://hamel.dev/blog/posts/evals-faq/), and [vitest-evals](https://vitest-evals.sentry.dev/docs).
