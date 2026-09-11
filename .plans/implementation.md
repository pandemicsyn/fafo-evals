# Learn Evals by Breaking Things — companion implementation plan

Status: implemented locally. Deterministic validation and live smoke tests completed; publication and teaching-effectiveness checks remain. See docs/verification.md.

Project: **fafo-evals**.

Tagline (user supplied): **Learn evals via fafo aka breaking things**.

Repository: https://github.com/pandemicsyn/fafo

Implementation checkout: `/Users/pandemicsyn/projects/neonronin/fafo-evals`.

Initial checkout baseline: clean working tree, `origin` points to the repository above, and the only working-tree file is `LICENSE` (MIT). At that time no runnable application, package manifest, README, or skill existed; these are now implemented. The repository and bundled skill have since switched to Apache 2.0 at the owner’s request.

Draft post: `src/content/blog/learn-to-write-evals.md` in this repository.

## Delivered implementation

- [x] Local Flue app with four tracker tools and server-bound per-trial state.
- [x] npm lockfile, compatible package override, Oxlint/Oxfmt, deterministic CI configuration.
- [x] Ignored `.dev.vars`, checked-in example, independent triage/judge overrides.
- [x] Fourteen authored cases, ten teaching lessons, synthetic and captured examples.
- [x] HTTP harness, per-turn snapshots, errors/artifacts, cleanup and overlapping-trial tests.
- [x] Graders, separate OpenRouter judge, human-label input, calibration/validation runs.
- [x] Bounded repetition command, archived reports, comparison and report viewer.
- [x] Standalone installable skill with Learn/Apply modes, hints and resumable-progress contract.
- [x] Actual free-model and Flash-judge observations recorded in `docs/verification.md`.
- [ ] Push, run remote CI, finish blog editorial verification, and conduct the human/agent teaching comparison in `.plans/skill-validation.md`.

The detailed checklist below preserves the original design requirements; unchecked fine-grained items are not claims of missing entire delivered components. Use the verification record above for completed evidence and the publication section for remaining checks.

## Accepted scope

- One substantial post for fullstack developers; a second post is optional, not required to complete the learning loop.
- Two independent entry points: read the self-contained article, or install the teaching skill and invoke the guided course without prior reading or an existing companion checkout.
- Use the existing `fafo-evals` repository and checkout for the local companion. Flue is the application framework; Vitest and `vitest-evals` provide evaluation tooling.
- Build an original issue-triage sample. The earlier refund scenario is superseded.
- No Cloudflare deployment exercise, hosting setup, Cloudflare account requirement, or real GitHub integration. Flue's ecosystem connection does not expand scope.
- Include recordings for initial inspection without credentials and live-model exercises against controlled local tools.
- Recommend the official `vitest-evals` agent skill alongside our installable `learn-evals` teaching skill.
- Use OpenRouter as the only live-model provider, with one API key and independently configurable triage and judge models. Prefer an inexpensive judge that passes the calibration exercise.
- Keep the post `draft: true` until the companion, code excerpts, setup, and source attribution are verified.
- The user authorized companion implementation and supplied a local OpenRouter credential file for bounded live verification. Never copy or commit the key.

## Editorial voice and skill tone

The user permits tactical colorful language in the post and teaching skill. Use the FAFO framing to support the learning loop: make a prediction, change something, inspect what actually happened.

- A little profanity is welcome when it makes a failure memorable: "The agent can do fuck-all and still pass this check."
- Aim the sharp language at weak checks, misleading results, and bad assumptions. Do not mock the learner or treat confusion as incompetence.
- Keep definitions, rubrics, tool contracts, diagnostics, and commands precise. Don't replace an explanation with a punchline.
- Avoid turning the skill into a relentless edgy persona. Match the learner's tone and use humor sparingly.
- The project is `fafo-evals`; retain `learn-evals` as the teaching skill's planned identifier unless an explicit naming decision changes it.

## Success criteria

A reader can clone, install locked dependencies, and inspect an example without configuring a service. With one OpenRouter API key, they can start a local Flue app and run one focused eval. They can then add a novel case, expose an inadequate grader, inspect a failure trace, and explain a comparison without being handed the answer.

Track setup completion and learner understanding separately from model pass rates. Intentional challenge failures must be visible and explained. A suite need not be all green to be educational.

## 1. Compatibility spike and dependency contract

- [x] Verify the user-created public repository and local checkout.
- [ ] Implement in `/Users/pandemicsyn/projects/neonronin/fafo-evals`. Do not embed its runtime dependencies in this blog application.
- [ ] Verify current compatible Flue, SDK, Vitest, `vitest-evals`, provider adapter, Node, and package-manager versions. Pin a working set, commit the lockfile, and record it in the README. Do not guess version numbers from the blog draft.
- [ ] Use npm as the reader-facing package manager unless an actual incompatibility requires changing this plan and the post together.
- [ ] Inspect Flue's `flue add tooling vitest-evals` blueprint and runnable example. Adapt their public HTTP SDK approach; preserve upstream license notices for any reused implementation.
- [ ] Prove a minimal mounted agent can run locally, complete a conversation through the SDK, and yield a normalized eval result with events and errors retained.
- [ ] Prove arbitrary typed `result.output` works with the selected `vitest-evals` version. The tutorial's object output is a companion contract, not an assumed Flue return type.
- [ ] Choose and document default triage and judge models on OpenRouter supported by the verified stack, independently configurable by environment. Load credentials explicitly for the app and optional judge processes. Missing credentials fail the requested live command clearly before it reports any passes.

Acceptance: one local HTTP eval works with correct session boundaries and typed output; no deployment, browser automation, or external issue tracker is required.

### OpenRouter setup and model selection

Keep one application, one dataset, and one eval harness. The Flue application and optional live judge share `OPENROUTER_API_KEY`, with separate model settings. The coding agent running the teaching skill uses the learner's existing coding-agent setup.

- [ ] Provide `.dev.vars.example` with `OPENROUTER_API_KEY`, `TRIAGE_MODEL`, and `JUDGE_MODEL`. These model settings are companion-owned configuration. Store raw OpenRouter model IDs (`vendor/model`) and translate to Flue's documented `openrouter/<vendor>/<model>` specifier at the application boundary. Verify the judge adapter's expected format separately.
- [ ] Select the triage model through the agent's `useModel()` call; do not assume a per-message model override exists. Verify a tool-capable model against the pinned Flue/Pi catalog, including multi-turn conversations and explicit tool errors.
- [ ] Verify the judge adapter can authenticate with the same OpenRouter key and return the required verdict/evidence structure. A missing or invalid key fails the requested live command clearly. Recorded lessons and deterministic checks require no key.
- [ ] Start judge evaluation with `JUDGE_MODEL=deepseek/deepseek-v4.1-flash`. The [OpenRouter listing](https://openrouter.ai/deepseek/deepseek-v4.1-flash) confirms DeepSeek V4.1 Flash and its identifier; adapter compatibility and performance on human-labeled calibration and held-out examples still need verification. Recheck availability and provider-specific pricing before publication. The listing documents JSON output without JSON-schema enforcement, so validate judge responses and preserve malformed responses as evaluation errors.
- [ ] Make cheap-judge selection a teaching exercise: hold application outputs fixed, compare candidate judges against human labels, inspect false accepts and false rejects, and report cost alongside agreement. Do not assume speed, model size, or price predicts suitability for this rubric.
- [ ] Record model IDs, judge rubric revision, sampling settings, and provider routing/fallback behavior in run artifacts. Prefer stable identifiers to moving aliases; disclose remaining routing variability in comparisons.
- [ ] Document current input/output rates and a bounded example run's measured cost in the companion README, with a verification date. Avoid hard-coding a price recommendation into the teaching skill; have it check the current catalog when helping choose models.

Acceptance: a clean local setup can run every live exercise with one OpenRouter key, change either model independently, and keep initial recorded lessons free of API calls.

Research basis: [Flue models](https://flueframework.com/docs/guide/models/), [Pi providers](https://pi.dev/docs/latest/providers), and [OpenRouter model discovery](https://openrouter.ai/docs/guides/overview/models). The implementation spike must still verify the complete app and judge path.

## 2. Local application and policy

The issue-triage agent operates a fictional tracker. Keep its tools small:

| Tool            | Contract                                                                    |
| --------------- | --------------------------------------------------------------------------- |
| `search_issues` | Return deterministic candidate summaries from the trial's seeded tracker    |
| `get_issue`     | Return the authoritative issue details or an explicit not-found result      |
| `create_issue`  | Validate required fields, insert once, return the stored issue ID           |
| `add_comment`   | Validate the target exists, append the report, return the stored comment ID |

Policy v1: a report requires affected feature, reproduction steps, expected behavior, and observed behavior. Ask for missing facts. An open issue is a duplicate only if feature, trigger, and observed failure match. Attach a duplicate report without creating another issue; otherwise create exactly one. Claim a write only after confirmation. If search fails, explain the limitation and do not make a write based on an unverified duplicate decision. Do not invent missing details.

- [ ] Implement tools with ordinary validation and unit tests. The underlying store enforces schema and valid references; the agent decides semantic completeness and duplicate relationships.
- [ ] Use a documented feature catalog, including `issue-search` and `saved-search-export`, so code examples have stable semantic identifiers.
- [ ] Use an in-memory per-trial store with deterministic fixture seed data and IDs. No database service is needed for this teaching app. If persistence is later needed for inspection, write artifacts separately after the run.
- [ ] Keep scenario fixtures independent of model-readable expectations. The model can see the policy and tracker records, never the grader's expected result or case category.
- [ ] Implement failure injection only in an explicitly selected lesson mode: false-success/no-write, wrong-target write, service error, and shared-state contamination. Normal operation must not silently enable these.
- [ ] Treat planted tool bugs, scripted transcripts, and actual live-model decisions as distinct evidence types in displays and metadata.

Acceptance: tool outcomes are independently inspectable; the tool validation prevents malformed data but does not hardcode the agent's semantic decisions into a fake perfect policy engine.

## 3. Harness and isolation

Follow Flue's HTTP integration using `@flue/sdk`. Start the app once; create a fresh conversation and tracker namespace for every trial. Do not start a new HTTP server per case.

### Trial lifecycle

1. Harness allocates a random trial/conversation ID and creates a namespace from a named fixture using a local test-control interface.
2. Capture the initial tracker snapshot outside the agent conversation.
3. Send only the user input through the public agent SDK. Capture admission/submission identifiers and wait for completion.
4. Retain only this trial's relevant events, including tool calls/results, usage, and any partial error evidence.
5. Read the authoritative final tracker snapshot independently.
6. Normalize output, transcript, trace, usage, and errors for `vitest-evals`; persist the trial artifact before cleanup.
7. Delete the trial namespace and settle/abort pending streams in all completion paths, including timeout.

The server must bind the tracker namespace to the conversation via trusted runtime context. Never let the model choose a trial ID through tool arguments. The control endpoints must exist only in the local lesson/test app, bind to loopback, and remain absent from the model's tool list.

If SDK context cannot supply a trustworthy conversation mapping, resolve that in the spike before building all cases; do not use a process-global "current trial" variable. It fails under overlapping runs.

### Companion-owned API shown in the draft

`createTriageHarness({ fixture: 'clear-new-report' })` creates a reusable harness whose every `run(input)` gets fresh state. `newIssues(before, after)` diffs stable IDs. Neither helper belongs to Flue or `vitest-evals`.

Proposed normalized output:

```ts
type TriageOutput = {
  reply: string;
  before: TrackerSnapshot;
  after: TrackerSnapshot;
};
```

Validate serialized snapshots on the harness side. Preserve library-supported transcript and trace fields instead of inventing incompatible top-level fields. State assertions inspect the snapshots, not agent-reported `success` or `decision` fields.

- [ ] Add snapshot diff helpers for new issues, new comments, and unexpected modifications.
- [ ] Add explicit scripted-conversation support: preserve a single trial across its turns and capture a snapshot after each turn. Keep repeated independent trials distinct from multi-turn conversations.
- [ ] Default lesson runs to serial, while verifying namespace isolation with at least two overlapping trials.
- [ ] Verify process cleanup, cancellation, missing server errors, missing credentials, and late writes after timeout. Capture artifacts before deleting state.

Acceptance: repeated cases cannot find previous trials' writes; a multi-turn case retains intended history; failures preserve enough evidence for diagnosis.

## 4. Fixtures, datasets, and exercises

Build 12–16 initial authored scenarios, grouped by behavior. This is a teaching set, not a representative benchmark. Reserve several cases from the guided tuning workflow, and document that files accessible to a coding agent are not a secure holdout.

| Post section                      | Scenario or artifact                                             | Learning verification                                        |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| 1. Success                        | Convincing reply with no issue                                   | Learner asks for independent state evidence                  |
| 2. Error analysis                 | Small annotated/unannotated trace collection                     | Learner links two failure definitions to actual observations |
| 3. Lies, damned lies, and graders | Missing write, wrong feature, duplicate write, valid paraphrase  | Check rejects seeded failures and accepts valid alternatives |
| 4. Dataset                        | True duplicate, false duplicate, incomplete and complete reports | Complementary positive/negative cases                        |
| 5. Trajectory                     | Two valid search paths; wrong issue ID                           | Necessary constraints without exact incidental sequencing    |
| 6. Conversation                   | Clarification followed by complete or still-incomplete detail    | No first-turn write; correct later action                    |
| 7. Judge                          | Preserved/missing/invented reproduction facts                    | Human/model disagreement review on real outputs              |
| 8. Repetition                     | Two prompt revisions, five trials per selected case              | All attempts retained; no unsupported winner claim           |
| 9. Environment                    | Shared tracker and too-short timeout                             | Classify confounder and invalidate affected comparisons      |
| 10. Decision                      | Per-case comparison and novel learner case                       | Explain outcome, regression, cost, and limitations           |

- [ ] Author original synthetic issues and reports; no scraped private tickets or copied benchmark datasets.
- [ ] Include metadata distinguishing constructed failure demonstrations from captured live runs, plus versions and capture settings. Recorded examples require a real capture or an explicit synthetic label.
- [ ] Keep exercise instructions separate from solutions. Use a bounded lesson selector or example files; do not reset a learner's working tree to change lessons.
- [ ] Give each exercise a reproducible broken artifact for diagnosis without promising that every live model will reproduce an intended mistake.
- [ ] Extract tested article snippets from the actual companion or check them automatically against their maintained counterparts.

## 5. Graders and reporting

- [ ] Deterministic checks: state deltas, issue/comment IDs, allowed feature values, required schema fields, prohibited writes, and per-turn invariants.
- [ ] Test grader behavior with deliberately wrong and valid alternative artifacts, not tests of headings or wording.
- [ ] Semantic judge: reproduction fidelity only, using report plus issue contents; return a narrow verdict, rationale, and evidence. Keep the optional judge model independently configurable through OpenRouter.
- [ ] Human calibration exercise uses real output examples and a separate validation batch. Repeat judging on identical inputs to inspect judge variance.
- [ ] Define criterion `pass`, `fail`, `not_applicable`, and `error` semantics independently from runner status. Required missing outcomes fail. Unavailable required evidence or judge failures remain errors. Never automatically turn either into passing skips.
- [ ] Report planned, attempted, completed, passed, failed, errored, and skipped counts with reasons. Document denominators. Show completed-trial correctness alongside execution reliability so errors cannot disappear from the headline.
- [ ] Preserve model, prompt hash/revision, fixture version, grader version, run/trial IDs, timestamp, timeout, concurrency, and available usage/latency. Unknown cost is unknown, not zero. Only derive cost from a recorded pricing basis.
- [ ] Repetitions expand into separately identified trials and artifacts; no assertion retry-until-pass. Paired offline comparisons use the same cases and settings, preferably interleaved conditions when practical.
- [ ] Show per-case and behavior-slice results. Explain five trials as an exercise budget, not statistical certification. Do not apply pass@k formulas to a pooled heterogeneous success rate.
- [ ] Use the existing `vitest-evals` local report UI where sufficient; add only the small tracker-state/annotation view it cannot supply. Avoid building an observability platform.

## 6. Reader command contract

These commands are implemented in the companion package. See its README for the verified invocation and limits.

| Command                | Behavior                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm ci`               | Install the pinned dependencies; no credentials or API calls           |
| `npm run examples`     | Open/print recorded cases with evidence and provenance; no model calls |
| `npm run dev`          | Start the local Flue app with documented provider-key loading          |
| `npm test`             | Run deterministic tool/harness/grader tests only                       |
| `npm run evals`        | Run a small default live suite against the already-running local app   |
| `npm run evals:repeat` | Run a bounded, explicitly counted repeated experiment                  |
| `npm run evals:judge`  | Run the optional, separately configured judge exercise                 |
| `npm run evals:report` | Open the latest saved eval artifact in the local report viewer         |

- [ ] Add `.dev.vars.example` containing placeholders, `.gitignore` entries for credentials and personal results, one supported runtime declaration, and a clear ready/health message.
- [ ] Document expected files and expected intentional failures next to commands. Provide focused case selection without defaulting to a large live suite.
- [ ] Print planned application and judge call counts where predictable; enforce per-trial time/turn limits and a bounded repetition count. Explain that actual token cost depends on execution.
- [ ] Verify fresh-clone setup on macOS and Linux, and assess Windows support honestly before claiming it. Use cross-platform Node scripts for orchestration rather than shell-specific env assignments.
- [ ] CI runs deterministic verification without secrets. Live suites are separate, on demand or deliberately scheduled; never silently skipped as successful verification.

## 7. Teaching skill

Keep the canonical skill at `.agents/skills/learn-evals/SKILL.md` with concise name/description and teaching workflow. `.claude/skills/learn-evals` is a relative symlink to that directory. The lesson CLI reads the canonical references. Add focused lesson and apply-mode references as needed; do not duplicate upstream library docs. Keep setup commands in a lightweight root `AGENTS.md`.

### Project entry point and optional installation

The default is **clone repo → open coding agent in it → request lesson 1** as a complete alternative to reading the post. The tutor uses the current checkout and helps install dependencies at the first runnable exercise. Optional standalone installation remains useful from other projects; it is not required before learning in the repo. The skill contains the course rather than fetching and summarizing the article.

- [ ] Target `/learn-evals` as the learner-facing command where supported. Verify installation, discovery, and exact invocation in each coding-agent client we document. Add a minimal client-specific command wrapper only where needed; keep the curriculum in the skill. Do not promise identical slash syntax across clients without testing it.
- [ ] Package the teaching essentials and lesson references with the installed skill. It must work without fetching this blog post or having its source in context.
- [ ] On invocation, briefly offer to start, resume, or apply the workflow to an existing project. Default a new learner to the first exercise, not an exhaustive intake questionnaire.
- [ ] Prefer the current `fafo-evals` checkout, including forks and renamed directories, and its matching project skill. Only course mode invoked elsewhere may need help finding or cloning the repo; apply mode stays in the learner's app. Preserve existing work.
- [ ] Check supported runtime/dependencies and guide setup. Explain what the commands accomplish without making environment setup the lesson.
- [ ] Begin with recorded examples and deterministic grader exercises; defer model-provider credentials until the first live lesson. Keep secrets out of conversation, progress files, and committed fixtures.
- [ ] When writing vitest-evals code, suggest the official skill if missing. Use official docs as a fallback; a second skill installation is not an onboarding step.
- [ ] Include a short explanation, prediction prompt, exercise action, evidence to inspect, hint progression, and completion criterion for each lesson. Don't dump the entire article into one response.
- [ ] Support natural requests such as "hint," "show me," "skip this," and "resume." Expose slash-command arguments only if the client supports and we verify them.
- [ ] Record the companion version/commit in learner progress. On resume, detect incompatible exercise changes and explain the needed adjustment rather than pretending an old checkpoint still matches.

Keep the article independently useful as well: worked examples and explanations must not require installing either skill. Share lesson IDs and tested code/artifacts across the post and skill; adapt the prose to reading versus interactive teaching.

Optional commands remain `npx skills add pandemicsyn/fafo --skill learn-evals` for portable tutoring and `npx skills add getsentry/vitest-evals` for library guidance. Verify installer discovery of `.agents/skills/learn-evals` after moving the skill, and check relative links from a relocated checkout.

Modes:

- **Learn:** guide the exercises; let the learner predict, label, and explain; offer hints before solutions; adapt the pace to demonstrated understanding.
- **Apply:** inspect the existing application and its actual failures; respect its framework; choose a useful boundary and the simplest justified grader.

Essential teaching behavior:

- Distinguish the tutor, application agent, and judge.
- Consult the official skill for `vitest-evals` mechanics when available; fall back to maintained official docs if it is missing.
- Do not force the tutorial framework onto unrelated existing applications.
- Preserve learner labels and original failed artifacts. Mark agent-suggested interpretations separately.
- Explain proposed changes to expectations; never weaken a check solely to make a run pass.
- Preserve all repeated outcomes, surface missing evidence, and avoid claims of general reliability from a small exercise.
- Keep a resumable progress file in a documented, ignored learner directory. Record completed work and unresolved reasoning, not invented mastery scores.
- Keep evaluation/tutor metadata out of the application input. Do not expose reserved tuning cases automatically.
- Let learners explicitly request a solution or faster pace. Teaching checkpoints must not become universal approval requirements for ordinary application work.

Acceptance: a new session with only the teaching skill installed can discover the course, prepare the local companion, teach the first concept without blog access or model credentials, and later resume progress and implement with current upstream guidance. A reader can also learn the core material from the post without using a coding agent.

## 8. Validate the skill's added value

Compare **official skill alone** against **official skill plus learn-evals** under matched coding-agent, fixture, prompt, and environment conditions. The official skill is the baseline, not a no-skill straw man.

- [ ] Exercise suite authoring, weak-grader repair, judge disagreement, invalid comparisons, and an unfamiliar small project.
- [ ] Check resulting behavior: the suite executes, catches a seeded failure, accepts a valid alternative, retains errors and repetitions, and does not modify reference expectations without explanation.
- [ ] Include negative activation requests that are ordinary unrelated development tasks.
- [ ] Separate explicit invocation from natural skill discovery tests.
- [ ] Test the complete skill-only entry path in a clean directory with no blog context, companion checkout, official skill, or provider credentials. Verify useful recorded-mode teaching before optional setup for live runs.
- [ ] Use isolated workspaces and multiple trials where nondeterminism could change conclusions. Test each coding-agent environment we claim to support.
- [ ] Pilot with human learners: can they write a new criterion and diagnose a novel failure without a supplied answer? Agent simulations validate conversation mechanics, not human learning.

## 9. Publication gate

- [ ] Finish companion implementation before changing the blog's draft flag.
- [ ] Verify every article command and code excerpt from a fresh clone with pinned dependencies.
- [ ] Retain the verified `pandemicsyn/fafo` clone URL; complete and test setup and both skill installation instructions before removing the draft note.
- [ ] Replace or explicitly retain illustrative report tables as illustrative; never present invented results as measurements.
- [ ] Confirm no refund scenario or deployment exercise remains.
- [x] Use Apache 2.0 for the repository and bundled skill. Omit custom copyright notices at the owner's request. Write original prose and examples; cite concepts at the relevant claims. Do not copy entire source articles into skill references.
- [ ] Verify links and rendered tables/code blocks. Ensure drafts remain excluded from production pages, feeds, and sitemap until publication.
- [ ] Record companion version/commit used to verify the post, supported runtime versions, known limitations, and measured setup observations.

## Source map

- [Flue eval guide](https://flueframework.com/docs/guide/evals/) and [integration](https://flueframework.com/docs/ecosystem/tooling/vitest-evals/): public SDK execution boundary and setup.
- [vitest-evals](https://vitest-evals.sentry.dev/docs), [custom harnesses](https://vitest-evals.sentry.dev/docs/harnesses/custom), and [official skill](https://vitest-evals.sentry.dev/docs/agent-skill): implementation contracts; recheck during the compatibility spike.
- [Anthropic, Demystifying evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): terminology, outcome/path distinction, repeated-trial questions.
- [LangChain, Deep Agents evals](https://www.langchain.com/blog/how-we-build-evals-for-deep-agents): behavior-focused grouping, correctness before efficiency.
- [Microsoft, AX evals](https://developer.microsoft.com/blog/building-ax-evals-that-actually-work/): evidence, criterion applicability, calibration.
- [Hamel and Shreya, Evals FAQ](https://hamel.dev/blog/posts/evals-faq/): error analysis, human judgment, cost of graders.
- [Anthropic, Infrastructure noise](https://www.anthropic.com/engineering/infrastructure-noise): execution conditions are part of the experiment; no universal score-gap cutoff.
- [Philipp Schmid, Testing skills](https://www.philschmid.de/testing-skills): skill validation and outcome-based comparisons.
- [Hamel and Shreya's written account of the video workflow](https://hamel.dev/blog/posts/evals-faq/how-can-i-efficiently-sample-production-traces-for-review.html): agent-assisted sampling with human labels. Direct YouTube transcript and X posts were unavailable during research; do not imply direct review of their full contents.

## Hands-on follow-up: lessons 5, 6, and 9

- [x] Add intentionally failing offline starters for trajectory checks, per-turn conversation grading, and trial isolation.
- [x] Add deterministic checkers that accept valid alternatives and reject planted failures; keep ordinary tests independent of learner progress.
- [x] Explain setup, learner edits, expected initial failure, and completion criteria in source comments.
- [x] Update the lesson runner, README, tutor guide/hints, and draft post with the actual exercise commands.

## Editorial and static review follow-up

- [x] Restructure the draft post: introduction, optional skill route, application/setup, then lessons 1–10. Move live setup to lesson 7 and comparisons to lesson 10.
- [x] Remove internal verification and publication notes from reader-facing blog/README instructions.
- [x] Independent Astra low static review and bounded re-review; fix actionable findings.
- [x] Validate JSON boundaries with Valibot and enforce type-aware unsafe-flow lint rules.
- [x] Preserve missing comparison evidence, skip unrelated incomplete archives, and retain primary errors alongside cleanup errors.
- [x] Verify 26 deterministic tests, Node 22 and 26, build, formatting, updated skill installation, and article continuity.
