# Lesson guide

Teach one lesson at a time. A task is a case; a trial is one execution; the harness runs it and gathers evidence; graders decide whether named criteria hold. The transcript shows what happened along the way. The outcome is the actual resulting state. These concepts travel to larger eval frameworks.

The local issue-triage agent searches a fictional tracker, asks for missing report facts, and creates one issue or comments once on an open duplicate. It must search before writing, read candidate details before deciding they're duplicates, and explain a search failure without writing. Preserve existing records and the user's facts. No GitHub connection or deployment is needed.

## 1 — What would convince you?

From the companion checkout, run `npm run examples`. Explain first that this prints prepared JSON in the terminal: no model runs, no real issue is created, and there is no code to repair in this lesson. Without a checkout, show the same evidence below and discuss it; setup can wait.

The input reports that pressing Escape clears issue-search text but leaves the list filtered. What you expected: one new issue about issue search containing the user's reproduction steps. Ask the learner where they would look to check that it was stored.

Focus on three printed fields: `output.reply` says “Created ISS-1 with your reproduction steps.” Both `output.before.issues` and `output.after.issues` are `[]`, meaning no stored issues. Have the learner describe what they got: a confirmation message but no issue. A successful write would put a new issue object in the after list. These are synthetic examples, not captured model failures.

Then run `npm run examples -- lying-tool`. Have the learner compare `trace[0].result`, which contains an issue object with `id: "ISS-1"`, with the still-empty `output.after.issues`. The receipt claims a write that the tracker doesn't contain. With no checkout, describe these two pieces of evidence instead.

Completion: for both examples, point to the success claim and the state evidence contradicting it. Explain why a reply or tool receipt is insufficient. Introduce the case/trial/harness/transcript/grader/outcome terms after inspecting the evidence. Save preservation of existing records for the seeded-state checks later; this tracker starts empty.

## 2 — Error analysis before a score

Predict two ways issue triage could hurt a user. Run `npm run examples -- --list`, then inspect two synthetic examples individually; leave the historical judge capture until after lesson 7's labeling. Write `.learn-evals/failures.md`: observation, user impact, and the cheapest evidence/check that could detect it. Label your own judgments before asking the tutor.

Avoid immediately reaching for a universal helpfulness score. A taxonomy earns its place by explaining observed failures.

Completion: two specific failures tied to artifacts, not vague “quality” labels.

## 3 — Break the grader

Run `npm run lesson -- 3`. It challenges `exercises/grader.ts` with synthetic outputs. Its initial nonzero exit is intentional: the supplied grader is wrong. Predict which bad output passes and which valid alternative fails.

Edit only the learner grader initially. Use tracker snapshots, stable IDs, exact new-issue count, feature, status, absence of new comments, and unchanged existing records. Rerun. You can import the companion's snapshot-diff helpers. Don't special-case example IDs or require one reply wording.

Completion: rejects no-write/wrong-feature/double-write and accepts a faithful paraphrase. Explain why a structurally valid issue can still lose reproduction facts.

## 4 — Cases that distinguish behavior

Run `npm run lesson -- 4`; read `src/evals/cases.ts` and `src/fixtures.ts`, excluding reserved entries during tuning. The file has 11 teaching cases and 3 reserved cases, not a production benchmark.

Predict: should a similarly titled issue about truncated large exports count as a duplicate of an empty export that hangs? Write a complementary case before editing the prompt. Required report facts: feature, trigger, expected, observed. Duplicate means matching feature, trigger and failure in an open issue.

Completion: add one novel case and its opposite/complement, with an unambiguous criterion.

## 5 — Outcome and trajectory

Run `npm run lesson -- 5`. It checks `exercises/trajectory.ts` against synthetic transcripts and independently observed tracker state; no API key is needed. The starter checks only whether `get_issue` was called, so the initial failure is intentional.

Event fields: `tool_call` has `id`, `name`, and `arguments`; `search_issues` takes `{ query }`, `get_issue` takes `{ id }`, and `add_comment` takes `{ issueId, body }`. A `tool_result` has `toolCallId`; a failed result has `error`, while a successful result has `content` and no error. The starter comments document this contract too.

Predict which paths should pass before editing: different queries and candidate-reading orders can be valid; reading the target after commenting, reading the wrong candidate, or using a failed read cannot justify the write. A successful-looking comment call can also write to the wrong tracker record.

Edit the learner function. Walk events in order, joining each `tool_result.toolCallId` to its `tool_call.id`. Count search and inspection only when their successful results arrive. The expected issue's read result must arrive after a successful search result and before the `add_comment` call; a read call alone or a result arriving after the write is insufficient. At the comment call, require `arguments.issueId === expectedIssueId`. Independently require exactly one stored comment on that target, no new issues, and unchanged existing records. Both arguments and state must match; prose naming a tool is not execution evidence. Keep challenge fixtures and expectations fixed. Rerun until both valid alternatives and planted failures are classified correctly.

Completion: explain why each constraint matters, pass the supplied checks, and propose a novel counterexample. The live suite in `src/evals/triage.eval.ts` retains its simpler search-presence assertion; integrating your stronger grader there is an explicit follow-up, not an automatic consequence of editing the exercise.

## 6 — Clarification is a conversation

Run `npm run lesson -- 6`. It checks `exercises/conversation.ts` against synthetic multi-turn observations, without model calls. Reports are incomplete on every turn before the last. The final expectation says whether the last turn supplies enough facts to create or still needs clarification.

The starter grades only the final state. Predict why a premature first-turn write can have exactly the same ending as a correct conversation. Edit the learner function to require observed turns, check every earlier snapshot against the original before state, and retain the final outcome check. Include the middle of a three-turn conversation: checking only the first and last snapshots is insufficient.

Completion: accept delayed creation and continued clarification; reject early issues/comments, interim damage to old records, missing observations, and wrong final outcomes. Pass the checker and explain one pair with the same ending but different grades. Question relevance still needs human review.

Keep this lesson offline. Revisit the conversation cases after model setup in lessons 7–8; editing the exercise does not alter the app's live grader.

## 7 — Give the judge one job

Run `npm run lesson -- 7` to see unlabeled calibration pairs. Label each in `.learn-evals/labels.json` as an object mapping its ID to `pass` or `fail`. Criterion: preserve reproduction facts without invention. Note supporting passages yourself.

For model calls, copy `.dev.vars.example` to the ignored `.dev.vars` file and add the OpenRouter key there. Then run `npm run evals:judge -- --labels=.learn-evals/labels.json`; the judge does not need the app server. This uses the separate OpenRouter judge model against fixed synthetic outputs. Without your file it compares against reference author labels; don't describe those as learner annotations. The tutor must not send human labels or expected verdicts to the judge.

Inspect false accepts and false rejects, not agreement alone. Try `--repeat=3` on the same outputs to expose judge variance. The shipped rubric is already v2: revise `src/evals/judge.ts` only if your evidence reveals an unclear criterion. If everything agrees, author a new borderline calibration pair instead of forcing a disagreement.

Before reading reference answers or historical captures, run `npm run lesson -- 7 --validation` and save your labels in `.learn-evals/validation-labels.json`. Then run `npm run evals:judge -- --validation --labels=.learn-evals/validation-labels.json`. Keep validation separate from your edits. The supplied validation batch was inspected during v2 development; it is practice data, not an untouched quality estimate. Use fresh cases for an independent check after tuning.

After labels for both batches are saved, ask the tutor for the lesson 7 debrief in [the reference approaches](solutions.md), or run `npm run examples -- judge-disagreement`. That is a historical Nemotron/v1 judge capture, not the current Flash/v2 judge. It is not a failure you must reproduce.

Completion: explain a disagreement with quoted evidence, or challenge the judge with a new borderline pair if it agrees on everything. Keep API/parse errors out of semantic pass/fail counts. No required issue means the quality criterion is inapplicable; a missing required issue is a failed outcome.

## 8 — Run it again

For live trials, start `npm run dev` after configuring `.dev.vars`, then run `npm run evals -- --cases=new-search` in another terminal. Inspect `npm run report`, `npm run evals:report`, and the minimal harness example in `examples/article-example.ts`: the harness sends the report, waits for completion, and captures the transcript and independent snapshots for assertions.

To execute that exact example, use `npm run evals:article` with the app running. It runs one live trial and writes `artifacts/article-results.json`, separate from the main suite and its comparisons. Ordinary `npm test` executes the same file using a scripted provider without model API calls.

Then run `npm run evals:repeat -- --cases=new-search`. This records five independent trials with no assertion retries. The app can make multiple model calls per trial; inspect the printed budget first. To stay offline, run `npm run lesson -- 8` for a labeled synthetic variation demonstration.

Optional conversation transfer: with the app running, use `npm run evals -- --cases=clarify-then-create,still-incomplete` and inspect `beforeFinal` and `output.turns` to connect lesson 6 to live per-turn snapshots.

Predict whether one pass means dependable behavior. Preserve all attempts. `pass@k` asks whether at least one of k attempts succeeds; `pass^k` asks whether all succeed. Don't compute these from a pooled success rate across unrelated tasks or assume independent trials without justification.

Completion: explain the question each metric answers and why five runs are an exercise budget.

## 9 — Break the environment

Run `npm run lesson -- 9`. It checks the deliberately broken factory in `exercises/isolation.ts`. Trial A writes an issue; trial B incorrectly inherits it because the starter returns one shared tracker. This is a synthetic harness defect, not model improvement, and requires no API key.

Predict what happens if you fix it by returning a new tracker on every call: separate trials become clean, but the same conversation forgets its prior turns. Edit the factory so each trial ID retains its own tracker within one store, initialized from the supplied seed. Keep different stores independent too.

Completion: pass checks for same-trial continuity, interleaved isolated writes, preserved seed records, unchanged seed input, independent closing, and separate stores. Explain how contamination could turn a new-issue case into an apparent duplicate case.

Then compare with the application's working `src/trials.ts` and inspect timeout/cleanup tests in `tests/http.test.ts`. A timeout is an execution error and a missing artifact is unavailable evidence. Repair the environment and rerun contaminated comparisons before tuning prompts.

## 10 — Make a decision and transfer it

Run `npm run evals -- --cases=new-search,true-duplicate,similar-title --repeat=3`; inspect `npm run report` and `npm run evals:report`. Keep the similar-but-different bug in the comparison: improving duplicate detection can also cause incorrect merging. Trial JSON files preserve snapshots and metadata. Change one prompt behavior in `src/policy.ts`, restart the application, and run the same command with models and graders fixed. Reports are archived automatically; `npm run compare` compares the latest two readable archives, shows missing evidence, and refuses an empty comparison. Explicit run IDs let you select another pair. If an expectation was wrong, correct it and rerun both revisions against that criterion. Keep failures as regression cases.

Explain what improved, what regressed, what remains uncertain, and what it cost (unknown cost is not zero). Check correctness before optimizing latency. Test a novel case authored by the learner before looking at reserved examples. Report slices: creating, duplicate handling, clarification, conversation, tool errors, instruction boundary.

Completion: a defensible decision with limits, plus a novel criterion. For another app, switch to apply mode rather than porting the fictional issue policy.
