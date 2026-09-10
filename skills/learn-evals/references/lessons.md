# Lesson guide

Teach one lesson at a time. A task is a case; a trial is one execution; the harness runs it and gathers evidence; graders decide whether named criteria hold. The transcript shows what happened along the way. The outcome is the actual resulting state. These concepts travel to larger eval frameworks.

The local issue-triage agent searches a fictional tracker, asks for missing report facts, and creates one issue or comments once on an open duplicate. It must search before writing, read candidate details before deciding they're duplicates, and explain a search failure without writing. Preserve existing records and the user's facts. No GitHub connection or deployment is needed.

## 1 — What would convince you?

No checkout needed: a user reports that pressing Escape clears issue-search text but leaves the list filtered. The agent replies, “Created ISS-1 with your reproduction steps.” The tracker contained zero issues before and zero after. This is a **synthetic teaching example**, not a captured model run.

Predict: did the task succeed? What would you inspect next?

Run `npm run examples` when the checkout is available. Inspect `output.before`, `output.after`, and `trace`. Explain how a credible answer can hide missing work. Then compare `npm run examples -- lying-tool`: even a successful-looking tool receipt can disagree with state.

Completion: the learner names independent state evidence and distinguishes a claimed write from an actual write. First hint: count issues before and after. Further hints: solutions lesson 1.

## 2 — Error analysis before a score

Predict two ways issue triage could hurt a user. Run `npm run examples -- --list`, then inspect two examples individually. Write `.learn-evals/failures.md`: observation, user impact, and the cheapest evidence/check that could detect it. Label your own judgments before asking the tutor.

Avoid immediately reaching for a universal helpfulness score. A taxonomy earns its place by explaining observed failures.

Completion: two specific failures tied to artifacts, not vague “quality” labels. Hint: “wrong feature” loses the report even though an issue exists.

## 3 — Break the grader

Run `npm run lesson -- 3`. It challenges `exercises/grader.ts` with synthetic outputs. Its initial nonzero exit is intentional: the supplied grader is wrong. Predict which bad output passes and which valid alternative fails.

Edit only the learner grader initially. Use tracker snapshots, stable IDs, exact new-issue count, feature, status, absence of new comments, and unchanged existing records. Rerun. You can import the companion's snapshot-diff helpers. Don't special-case example IDs or require one reply wording.

Completion: rejects no-write/wrong-feature/double-write and accepts a faithful paraphrase. Explain why a structurally valid issue can still lose reproduction facts. Hint: inspect output state; solutions lesson 3 has a reference approach.

## 4 — Cases that distinguish behavior

Run `npm run lesson -- 4`; read `src/evals/cases.ts` and `src/fixtures.ts`, excluding reserved entries during tuning. These 14 authored cases are a teaching set, not a production benchmark.

Predict: should a similarly titled issue about truncated large exports count as a duplicate of an empty export that hangs? Write a complementary case before editing the prompt. Required report facts: feature, trigger, expected, observed. Duplicate means matching feature, trigger and failure in an open issue.

Completion: add one novel case and its opposite/complement, with an unambiguous criterion. Hint: compare true duplicate, similar-title and closed-duplicate.

## 5 — Outcome and trajectory

Run `npm run lesson -- 5`. It checks `exercises/trajectory.ts` against synthetic transcripts and independently observed tracker state; no API key is needed. The starter checks only whether `get_issue` was called, so the initial failure is intentional.

Predict which paths should pass before editing: different queries and candidate-reading orders can be valid; reading the target after commenting, reading the wrong candidate, or using a failed read cannot justify the write. A successful-looking comment call can also write to the wrong tracker record.

Edit the learner function. Require successful search, successful inspection of the expected duplicate after search and before the comment call, and one actual comment on that target with no collateral writes. Match tool calls to results by ID; prose naming a tool is not execution evidence. Keep challenge fixtures and expectations fixed. Rerun until both valid alternatives and planted failures are classified correctly.

Completion: explain why each constraint matters, pass the supplied checks, and propose a novel counterexample. Hint: walk ordered events and keep the independently observed state check. The live suite in `src/evals/triage.eval.ts` retains its simpler search-presence assertion; integrating your stronger grader there is an explicit follow-up, not an automatic consequence of editing the exercise.

## 6 — Clarification is a conversation

Run `npm run lesson -- 6`. It checks `exercises/conversation.ts` against synthetic multi-turn observations, without model calls. Reports are incomplete on every turn before the last. The final expectation says whether the last turn supplies enough facts to create or still needs clarification.

The starter grades only the final state. Predict why a premature first-turn write can have exactly the same ending as a correct conversation. Edit the learner function to require observed turns, check every earlier snapshot against the original before state, and retain the final outcome check. Include the middle of a three-turn conversation: checking only the first and last snapshots is insufficient.

Completion: accept delayed creation and continued clarification; reject early issues/comments, interim damage to old records, missing observations, and wrong final outcomes. Pass the checker and explain one pair with the same ending but different grades. Hint: reuse `gradeOutcome` for each earlier turn with the clarification expectation. Question relevance still needs human review.

Keep this lesson offline. Revisit the conversation cases after model setup in lessons 7–8; editing the exercise does not alter the app's live grader.

## 7 — Give the judge one job

Run `npm run lesson -- 7` to see unlabeled calibration pairs. Label each in `.learn-evals/labels.json` as an object mapping its ID to `pass` or `fail`. Criterion: preserve reproduction facts without invention. Note supporting passages yourself.

For model calls, copy `.dev.vars.example` to the ignored `.dev.vars` file and add the OpenRouter key there. Then run `npm run evals:judge -- --labels=.learn-evals/labels.json`; the judge does not need the app server. This uses the separate OpenRouter judge model against fixed synthetic outputs. Without your file it compares against reference author labels; don't describe those as learner annotations. The tutor must not send human labels or expected verdicts to the judge.

Inspect false accepts and false rejects, not agreement alone. Run `npm run examples -- judge-disagreement` for the captured failure where a judge accepted an invented Redux diagnosis. Try `--repeat=3` on the same outputs to expose judge variance. Revise the rubric after inspecting disagreements, then run `npm run evals:judge -- --validation` on the separate batch. Once that batch informs a rubric revision, it is development data; use fresh examples for another independent check. A few examples demonstrate calibration, not readiness to gate production.

Completion: explain one disagreement with quoted evidence, or challenge the judge with a new borderline pair if it agrees on everything. Keep API/parse errors out of semantic pass/fail counts. No required issue means the quality criterion is inapplicable; a missing required issue is a failed outcome. Hint: the polished issue that omits “zero matches” is the dangerous kind of failure.

## 8 — Run it again

For live trials, start `npm run dev` after configuring `.dev.vars`, then run `npm run evals -- --cases=new-search` in another terminal. Inspect `npm run report`, `npm run evals:report`, and the minimal harness example in `examples/article-example.ts`: the harness sends the report, waits for completion, and captures the transcript and independent snapshots for assertions.

Then run `npm run evals:repeat -- --cases=new-search`. This records five independent trials with no assertion retries. The app can make multiple model calls per trial; inspect the printed budget first. To stay offline, run `npm run lesson -- 8` for a labeled synthetic variation demonstration.

Optional conversation transfer: with the app running, use `npm run evals -- --cases=clarify-then-create,still-incomplete` and inspect `beforeFinal` and `output.turns` to connect lesson 6 to live per-turn snapshots.

Predict whether one pass means dependable behavior. Preserve all attempts. `pass@k` asks whether at least one of k attempts succeeds; `pass^k` asks whether all succeed. Don't compute these from a pooled success rate across unrelated tasks or assume independent trials without justification.

Completion: explain the question each metric answers and why five runs are an exercise budget. Hint: compare “3 of 5 succeeded” with “eventually got one pass.”

## 9 — Break the environment

Run `npm run lesson -- 9`. It checks the deliberately broken factory in `exercises/isolation.ts`. Trial A writes an issue; trial B incorrectly inherits it because the starter returns one shared tracker. This is a synthetic harness defect, not model improvement, and requires no API key.

Predict what happens if you fix it by returning a new tracker on every call: separate trials become clean, but the same conversation forgets its prior turns. Edit the factory so each trial ID retains its own tracker within one store, initialized from the supplied seed. Keep different stores independent too.

Completion: pass checks for same-trial continuity, interleaved isolated writes, preserved seed records, unchanged seed input, independent closing, and separate stores. Explain how contamination could turn a new-issue case into an apparent duplicate case. Hint: scope a map to the factory and key it by trial ID; the Tracker constructor copies seed state.

Then compare with the application's working `src/trials.ts` and inspect timeout/cleanup tests in `tests/http.test.ts`. A timeout is an execution error and a missing artifact is unavailable evidence. Repair the environment and rerun contaminated comparisons before tuning prompts.

## 10 — Make a decision and transfer it

Run `npm run evals -- --cases=new-search,true-duplicate,similar-title --repeat=3`; inspect `npm run report` and `npm run evals:report`. Keep the similar-but-different bug in the comparison: improving duplicate detection can also cause incorrect merging. Trial JSON files preserve snapshots and metadata. Change one prompt behavior in `src/policy.ts`, restart the application, and run the same command with models and graders fixed. Reports are archived automatically; `npm run compare` compares the latest two readable archives, shows missing evidence, and refuses an empty comparison. Explicit run IDs let you select another pair. If an expectation was wrong, correct it and rerun both revisions against that criterion. Keep failures as regression cases.

Explain what improved, what regressed, what remains uncertain, and what it cost (unknown cost is not zero). Check correctness before optimizing latency. Test a novel case authored by the learner before looking at reserved examples. Report slices: creating, duplicate handling, clarification, conversation, tool errors, instruction boundary.

Completion: a defensible decision with limits, plus a novel criterion. For another app, switch to apply mode rather than porting the fictional issue policy.
