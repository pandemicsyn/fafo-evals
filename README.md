# FAFO evals

**Learn evals via fafo aka breaking things.**

An issue-triage agent, four deliberately broken exercises, and ten short lessons. Find out whether the agent did the work—or just confidently said some shit. Built for TypeScript/fullstack developers using Flue, Vitest, and vitest-evals.

The fictional tracker stays on your machine. No deployment, Cloudflare account, GitHub token, or real issue writes.

## Or learn with your coding agent

Install the course and the official implementation guide:

```sh
npx skills add pandemicsyn/fafo-evals --skill learn-evals
npx skills add getsentry/vitest-evals
```

Ask your coding agent: “Use the learn-evals skill to teach me evals. Start with lesson 1 and let me try before showing the answer.” You can also use your client’s skill picker or `/learn-evals` where supported. The course can start without reading the blog or cloning this app first.

The tutor asks for predictions, helps inspect evidence, offers hints, and saves progress under ignored `.learn-evals/`. Ask for “hint,” “show me,” “skip,” or “resume.” It also has an **apply** mode for your own app. Its lessons are available to read directly under [skills/learn-evals/references](skills/learn-evals/references).

## Start without an API key

Use **Node 22.19+** (Node 22 LTS recommended) and npm.

```sh
git clone https://github.com/pandemicsyn/fafo-evals.git
cd fafo-evals
npm ci
npm run examples
npm run lesson -- 1
```

Examples are explicitly **synthetic**, so the failures are reproducible without credentials. `npm test` runs deterministic checks and a real Flue HTTP integration with a scripted provider. Neither measures live-model quality.

Get to the code: these offline challenges intentionally fail until you fix their learner functions. Each file explains the setup, task, and success criteria. No API key is needed.

| Lesson                | Exercise                                     | What you fix                                         |
| --------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `npm run lesson -- 3` | [grader.ts](exercises/grader.ts)             | A grader that trusts the reply instead of state      |
| `npm run lesson -- 5` | [trajectory.ts](exercises/trajectory.ts)     | A check that ignores tool success, order, and target |
| `npm run lesson -- 6` | [conversation.ts](exercises/conversation.ts) | A final-only check that misses premature writes      |
| `npm run lesson -- 9` | [isolation.ts](exercises/isolation.ts)       | Shared state that leaks between trials               |

Keep the challenge cases and expectations fixed while solving, then add your own counterexample. Ordinary `npm test` should pass even while these starters are broken; it verifies the course machinery, not learner completion.

## Run the live agent

Copy `.dev.vars.example` to `.dev.vars` and add your OpenRouter API key locally. **`.dev.vars` is ignored by Git. Never commit a real key.** The example contains placeholders only.

```dotenv
OPENROUTER_API_KEY=your-key-here
TRIAGE_MODEL=nvidia/nemotron-3-super-120b-a12b:free
JUDGE_MODEL=z-ai/glm-5.3-flash
```

Both model settings take raw OpenRouter IDs. Override either independently and restart the app. The app adds Flue's `openrouter/` prefix internally. Environment variables already set in your shell take precedence over `.dev.vars`. Your coding-agent subscription/login is separate from this app's model calls.

```sh
npm run dev
```

In another terminal:

```sh
npm run evals
npm run evals:report
```

The default suite has three cases. One trial may make several model calls; it has a 120-second harness deadline, a 24-tool-call budget, and a 4,096-token limit per application model response. No assertion retries. The judge is opt-in and has its own 45-second call timeout and 1,200-token response limit. Rate limits, truncation and malformed responses surface as errors.

The app binds to `127.0.0.1:3583`. Its local test-control routes allocate, inspect and close trackers. They are intentionally part of a local teaching harness, not an authenticated production issue service. If you change `FLUE_URL`, it must remain a loopback HTTP origin. Restarting the app invalidates active in-memory trials.

### Free models and upgrades

The application defaults to `nvidia/nemotron-3-super-120b-a12b:free`; the optional judge defaults to `z-ai/glm-5.3-flash`. Free models make live experimentation accessible. Judge choice still depends on agreement with human labels: a model that handles triage reasonably can miss invented facts when grading issue text. Lesson 7 explores that distinction.

Use `npm run models` to inspect current free, tool-capable OpenRouter models and whether this pinned Flue catalog recognizes them. [OpenRouter's free collection](https://openrouter.ai/collections/free-models) changes over time. A specific model ID makes comparisons easier to interpret than `openrouter/free`, which can select different models.

An inexpensive upgrade candidate is [GLM 5.3 Flash](https://openrouter.ai/z-ai/glm-5.3-flash). Judge suitability comes from calibration against your labels, not its price or benchmark ranking. See [verification notes](docs/verification.md) for the actual smoke-test evidence and limits.

## Exercises and commands

| Command                                                    | What it does                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `npm run examples -- --list`                               | List synthetic failure examples; no model calls                      |
| `npm run lesson -- 1` through `10`                         | Print a lesson; 3/5/6/9 check exercises, 7/8 show examples           |
| `npm run evals -- --cases=true-duplicate,similar-title`    | Run selected live cases                                              |
| `npm run evals -- --all`                                   | Run all teaching cases, excluding reserved examples                  |
| `npm run evals:repeat -- --cases=new-search`               | Five independent trials; retain every result                         |
| `npm run evals:judge`                                      | Grade three fixed synthetic outputs against reference author labels  |
| `npm run evals:judge -- --labels=.learn-evals/labels.json` | Compare against your own labels                                      |
| `npm run evals:judge -- --validation`                      | Use the separate validation batch                                    |
| `npm run report`                                           | Show counts and missing/error evidence for the latest run            |
| `npm run evals:report`                                     | Open vitest-evals' local transcript/report UI                        |
| `npm run compare`                                          | Compare the latest two archived runs with matching cases/repetitions |
| `npm run verify`                                           | Format check, Oxlint, TypeScript, deterministic tests, build         |
| `npm run format`                                           | Format with Oxfmt                                                    |
| `npm run lint`                                             | Type-aware Oxlint, including unsafe and explicit `any` checks        |

Lesson 7 prints unlabeled pairs. Save your own judgments in `.learn-evals/labels.json` as an object mapping every displayed example ID to `"pass"` or `"fail"`. The judge never receives those labels. `--repeat=3` repeats grading on identical outputs so application variation doesn't obscure judge variation.

Each live trial saves input, transcript, tool events, independent before/after and per-turn snapshots, runtime usage metadata, revisions, timing, and errors under `artifacts/trials/`. Run summaries and Vitest JSON are archived under `artifacts/runs/`; the local UI opens the latest result. These artifacts and learner progress are ignored by Git. Provider catalog cost estimates are not bills; unknown cost stays `null`.

## What the agent is supposed to do

A report needs a feature, reproduction steps, expected behavior and observed behavior. Ask for missing facts. Search before writing and read candidate details. An **open** issue is a duplicate only when feature, trigger and failure match. Add one comment to the duplicate; otherwise create one issue. Confirm a write only after its tool succeeds. If search is unavailable, explain the limitation and don't write on an unverified duplicate decision.

This is the course's fictional policy, not a universal issue-management policy.

The deterministic graders check state changes, IDs, feature/status, and prohibited writes. They deliberately **do not prove semantic fidelity or question relevance**. Human review and a narrow judge cover those gaps. The `missing-trigger` example passes the structural grader; that's a lesson, not a hidden claim that it succeeded.

## Layout

- `src/agents/triage.ts`: the Flue agent and four local tools.
- `src/tracker.ts`, `fixtures.ts`, `trials.ts`: state, authored fixtures, trial isolation.
- `src/evals/`: cases, HTTP harness, deterministic graders, synthetic examples, judge adapter.
- `exercises/`: broken starters for state grading, trajectory checks, conversations, and isolation.
- `skills/learn-evals/`: installable standalone teaching skill.
- `.plans/`: implementation history and remaining publication checks.

`createTriageHarness()` and snapshot helpers are companion code, not Flue/vitest-evals exports. The harness uses `@flue/sdk` at the public HTTP boundary. The same criterion/data/harness/grader concepts transfer to larger systems with annotation, dataset management and production monitoring.

## Dependency notes and references

JSON inputs are validated with Valibot. `npm run lint` uses type-aware Oxlint rules to reject explicit `any` and unsafe inferred flows.

Versions are pinned in `package.json` and `package-lock.json`. Flue 2.0.4's published Vite package has an unresolved `workspace:*` runtime dependency; the npm override pins it to the matching runtime release. Vitest is pinned to 4 because vitest-evals 0.16.1 requires `<5`.

Pi's pinned catalog predates GLM 5.3 Flash. `src/provider.ts` adds its public metadata to the normal OpenRouter provider and caps application response size; authentication/streaming still use Pi. Refresh that metadata when changing the lockfile. The judge calls OpenRouter's chat-completions endpoint and validates its JSON locally.

This repository, including its original code, issue fixtures, teaching prose, and installable skill, is licensed under the [Apache License 2.0](LICENSE).

Further reading: [Flue's eval guide](https://flueframework.com/docs/guide/evals/), [vitest-evals custom harnesses](https://vitest-evals.sentry.dev/docs/harnesses/custom), [Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [Hamel and Shreya](https://hamel.dev/blog/posts/evals-faq/), [LangChain](https://www.langchain.com/blog/how-we-build-evals-for-deep-agents), [Microsoft AX](https://developer.microsoft.com/blog/building-ax-evals-that-actually-work/), and [Philipp Schmid](https://www.philschmid.de/testing-skills).
