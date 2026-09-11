# Running the exercises

## Learn with your coding agent

Clone the repo and open your agent in it, as shown in the [README](../README.md). The teaching skill is part of the checkout; no skill installation is needed for the course. The agent can help with the commands below as you reach each exercise.

The project skill lives in `.agents/skills/learn-evals`, discovered by [Codex](https://learn.chatgpt.com/docs/build-skills) and [Kilo](https://kilo.ai/docs/customize/skills). `.claude/skills/learn-evals` links to the same directory for [Claude Code](https://code.claude.com/docs/en/skills). Open a new session in the checkout if it isn't listed. If your client doesn't discover it, or selects an older installed copy, ask it to read `.agents/skills/learn-evals/SKILL.md` directly. This also works when your Git checkout doesn't preserve symlinks.

## Start without an API key

Use **Node 22.19+** (Node 22 LTS recommended) and npm.

```sh
git clone https://github.com/pandemicsyn/fafo.git
cd fafo
npm ci
npm run examples
npm run lesson -- 1
```

Examples are explicitly **synthetic**, so the failures are reproducible without credentials. `npm test` runs deterministic checks and a real Flue HTTP integration with a scripted provider. Neither measures live-model quality.

Get to the code: these offline challenges intentionally fail until you fix their learner functions. Each file explains the setup, task, and success criteria. No API key is needed.

| Lesson                | Exercise                                        | What you fix                                         |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `npm run lesson -- 3` | [grader.ts](../exercises/grader.ts)             | A grader that trusts the reply instead of state      |
| `npm run lesson -- 5` | [trajectory.ts](../exercises/trajectory.ts)     | A check that ignores tool success, order, and target |
| `npm run lesson -- 6` | [conversation.ts](../exercises/conversation.ts) | A final-only check that misses premature writes      |
| `npm run lesson -- 9` | [isolation.ts](../exercises/isolation.ts)       | Shared state that leaks between trials               |

Keep the challenge cases and expectations fixed while solving, then add your own counterexample. Ordinary `npm test` should pass even while these starters are broken; it verifies the course machinery, not learner completion.

## Run the live agent

Copy `.dev.vars.example` to `.dev.vars` and add your OpenRouter API key locally. **`.dev.vars` is ignored by Git. Never commit a real key.** The example contains placeholders only.

```dotenv
OPENROUTER_API_KEY=your-key-here
TRIAGE_MODEL=nvidia/nemotron-3-super-120b-a12b:free
JUDGE_MODEL=deepseek/deepseek-v4.1-flash
JUDGE_PROVIDER=deepseek
```

For the judge, optional `JUDGE_PROVIDER` selects a preferred OpenRouter provider slug, such as `fireworks` or `deepseek`. Leave it blank for automatic routing. OpenRouter may fall back to another provider serving the same model if the preferred provider is unavailable. Judge artifacts record the routing preference and the actual provider for each completed response; inspect those when comparing runs. This does not retry a completed grade or switch the selected model.

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

The application defaults to `nvidia/nemotron-3-super-120b-a12b:free`; the optional judge defaults to `deepseek/deepseek-v4.1-flash`. Free models make live experimentation accessible. Judge choice still depends on agreement with human labels: a model that handles triage reasonably can miss invented facts when grading issue text. Lesson 7 explores that distinction.

Use `npm run models` to inspect current free, tool-capable OpenRouter models and whether this pinned Flue catalog recognizes them. [OpenRouter's free collection](https://openrouter.ai/collections/free-models) changes over time. A specific model ID makes comparisons easier to interpret than `openrouter/free`, which can select different models.

[DeepSeek V4.1 Flash](https://openrouter.ai/deepseek/deepseek-v4.1-flash) is the paid judge used in the walkthrough. Judge suitability comes from calibration against your labels, not its price or benchmark ranking. See [verification notes](verification.md) for the actual smoke-test evidence and limits.

## Exercises and commands

| Command                                                    | What it does                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `npm run examples -- --list`                               | List synthetic failure examples; no model calls                      |
| `npm run lesson -- 1` through `10`                         | Print a lesson; 3/5/6/9 check exercises, 7/8 show examples           |
| `npm run lesson -- 7 --validation`                         | Show the separate validation pairs without reference labels          |
| `npm run evals -- --cases=true-duplicate,similar-title`    | Run selected live cases                                              |
| `npm run evals:article`                                    | Run the exact article example as one live trial                      |
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

Lesson 7 prints pairs with neutral IDs and no reference labels. Save your own judgments in `.learn-evals/labels.json` as an object mapping every displayed example ID to `"pass"` or `"fail"`. Use `npm run lesson -- 7 --validation` for the other split, save `.learn-evals/validation-labels.json`, and compare with `npm run evals:judge -- --validation --labels=.learn-evals/validation-labels.json`. Save both sets of labels before opening reference answers or the historical judge capture. The judge never receives those labels. `--repeat=3` repeats grading on identical outputs so application variation doesn't obscure judge variation.

The shipped judge rubric is v2. Historical Nemotron/v1 failures illustrate earlier behavior; reproducing them is not required. Revise the current rubric only when new evidence justifies it. Both supplied splits were inspected during development and are practice data. For a fresh quality estimate, author new examples. If resuming an older checkout, preserve old label files and map their IDs to the unchanged pairs; renamed IDs do not make previously seen examples unseen.

Each live trial saves input, transcript, tool events, independent before/after and per-turn snapshots, runtime usage metadata, revisions, timing, and errors under `artifacts/trials/`. Run summaries and Vitest JSON are archived under `artifacts/runs/`; the local UI opens the latest result. These artifacts and learner progress are ignored by Git. Provider catalog cost estimates are not bills; unknown cost stays `null`.

With the app running, `npm run evals:article` executes `examples/article-example.ts` as one live trial (potentially several model calls). Its Vitest report goes to `artifacts/article-results.json`, separate from the main suite's report and comparison archives. `npm test` executes that same file with a scripted provider, real local HTTP calls, and no model API calls; those trial artifacts are marked `scripted-provider`.

## What the agent is supposed to do

A report needs a feature, reproduction steps, expected behavior and observed behavior. Ask for missing facts. Search before writing and read candidate details. An **open** issue is a duplicate only when feature, trigger and failure match. Add one comment to the duplicate; otherwise create one issue. Confirm a write only after its tool succeeds. If search is unavailable, explain the limitation and don't write on an unverified duplicate decision.

This is the course's fictional policy, not a universal issue-management policy.

The deterministic graders check state changes, IDs, feature/status, and prohibited writes. They deliberately **do not prove semantic fidelity or question relevance**. Human review and a narrow judge cover those gaps. The `missing-trigger` example passes the structural grader; that's a lesson, not a hidden claim that it succeeded.

## Layout

- `src/agents/triage.ts`: the Flue agent and four local tools.
- `src/tracker.ts`, `fixtures.ts`, `trials.ts`: state, authored fixtures, trial isolation.
- `src/evals/`: cases, HTTP harness, deterministic graders, synthetic examples, judge adapter.
- `exercises/`: broken starters for state grading, trajectory checks, conversations, and isolation.
- `.agents/skills/learn-evals/`: teaching skill and references, also available through the optional installer.
- `.claude/skills/learn-evals`: relative symlink to the same skill for Claude Code.
- `AGENTS.md`: setup and run commands for coding agents.
- `.plans/`: implementation history and remaining publication checks.

`createTriageHarness()` and snapshot helpers are companion code, not Flue/vitest-evals exports. The harness uses `@flue/sdk` at the public HTTP boundary. The same criterion/data/harness/grader concepts transfer to larger systems with annotation, dataset management and production monitoring.

## Dependency notes and references

JSON inputs are validated with Valibot. `npm run lint` uses type-aware Oxlint rules to reject explicit `any` and unsafe inferred flows.

Versions are pinned in `package.json` and `package-lock.json`. Flue 2.0.4's published Vite package has an unresolved `workspace:*` runtime dependency; the npm override pins it to the matching runtime release. Vitest is pinned to 4 because vitest-evals 0.16.1 requires `<5`.

Pi's pinned catalog predates DeepSeek V4.1 Flash. `src/provider.ts` adds its public metadata to the normal OpenRouter provider and caps application response size; authentication/streaming still use Pi. Refresh that metadata when changing the lockfile. The judge calls OpenRouter's chat-completions endpoint and validates its JSON locally.

This repository, including its original code, issue fixtures, teaching prose, and installable skill, is licensed under the [Apache License 2.0](../LICENSE).

Further reading: [Flue's eval guide](https://flueframework.com/docs/guide/evals/), [vitest-evals custom harnesses](https://vitest-evals.sentry.dev/docs/harnesses/custom), [Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [Hamel and Shreya](https://hamel.dev/blog/posts/evals-faq/), [LangChain](https://www.langchain.com/blog/how-we-build-evals-for-deep-agents), [Microsoft AX](https://developer.microsoft.com/blog/building-ax-evals-that-actually-work/), and [Philipp Schmid](https://www.philschmid.de/testing-skills).
