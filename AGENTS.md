# FAFO

This repo teaches evals through an issue-triage agent and deliberately broken exercises. For tutoring requests, read `.agents/skills/learn-evals/SKILL.md` and follow the current lesson. Use this checkout.

Run commands from the repo root with Node 22.19+ and npm:

- `npm ci` installs dependencies.
- `npm run examples` prints a synthetic trial; no model key needed.
- `npm run lesson -- N` opens lesson 1–10. Lessons 3, 5, 6, and 9 intentionally fail until the learner fixes the exercise. Preserve the challenge expectations.
- For live evals, copy `.dev.vars.example` to `.dev.vars` and add an OpenRouter key there. Start `npm run dev`, then run `npm run evals` in another terminal. Never commit the key.
- `npm run format` formats with Oxfmt; `npm run verify` checks formatting, lint, types, tests, and build. Ordinary tests should pass with unsolved exercises.

Show learners the actual exercise output in your response. See `docs/usage.md` for model settings and additional commands.
