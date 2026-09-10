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

Run `npm run examples -- --list`, then `npm run examples -- wrong-feature` and `npm run examples -- double-write`. These print prepared JSON; this lesson produces notes, not a code repair. Ask what one correctly filed report should change. Inspect `output.after.issues[0].feature` in the first example and count `output.after.issues` in the second. Leave the historical judge capture until after lesson 7's labeling. Create `.learn-evals/` if needed, then write `failures.md`: observation, user impact, and the cheapest evidence/check that could detect it. Label your own judgments before asking the tutor.

Avoid immediately reaching for a universal helpfulness score. A taxonomy earns its place by explaining observed failures.

Completion: two specific failures tied to artifacts, not vague “quality” labels.

## 3 — Break the grader

Run `npm run lesson -- 3` and open `exercises/grader.ts`. It prints a table and initially exits nonzero because the supplied grader is wrong. Explain the columns before interpreting the score: `expected` is whether the example should be accepted, `actual` is the learner grader's verdict, and `graderCorrect` says whether they agree. A bad output correctly rejected has false/false/true. Inspect `convincing-no-write`, then predict which valid alternative the starter rejects.

Edit only the learner grader initially. Use tracker snapshots, stable IDs, exact new-issue count, feature, status, absence of new comments, and unchanged existing records. Rerun. You can import the companion's snapshot-diff helpers. Don't special-case example IDs or require one reply wording.

Completion: rerun until every row has `graderCorrect: true`, rejecting no-write/wrong-feature/double-write and accepting a faithful paraphrase. Explain the false acceptance and false rejection repaired, and why a structurally valid issue can still lose reproduction facts.

## 4 — Cases that distinguish behavior

Run `npm run lesson -- 4`; it prints instructions, not a model score. The task is to add two entries to the `cases` array in `src/evals/cases.ts`. Read `src/fixtures.ts` for starting states, excluding reserved entries during tuning. The file has 11 teaching cases and 3 reserved cases, not a production benchmark. Copy an ordinary case as a starting point, then supply unique `id`, behavior `slice`, `fixture`, user-message `turns`, and `expected` action for each new case.

Predict: should a similarly titled issue about truncated large exports count as a duplicate of an empty export that hangs? Write a complementary case before editing the prompt. Required report facts: feature, trigger, expected, observed. Duplicate means matching feature, trigger and failure in an open issue.

Completion: add one novel case and its opposite/complement, with an unambiguous criterion, and explain the expected relationship. Run `npm run check` for TypeScript mistakes; this validates neither the expectation nor model behavior. Live execution comes in lesson 8.

## 5 — Outcome and trajectory

Run `npm run lesson -- 5` and open `exercises/trajectory.ts`. It checks synthetic transcripts and independently observed tracker state; no API key is needed. The table's `expected` and `actual` columns compare the desired verdict with the learner function's result; `passed` is their agreement. False/false/true means a bad path was correctly rejected. The starter checks only whether `get_issue` was called, so its initial failure is intentional. Inspect `read-after-write` before repairing `learnerTrajectory`.

Event fields: `tool_call` has `id`, `name`, and `arguments`; `search_issues` takes `{ query }`, `get_issue` takes `{ id }`, and `add_comment` takes `{ issueId, body }`. A `tool_result` has `toolCallId`; a failed result has `error`, while a successful result has `content` and no error. The starter comments document this contract too.

Predict which paths should pass before editing: different queries and candidate-reading orders can be valid; reading the target after commenting, reading the wrong candidate, or using a failed read cannot justify the write. A successful-looking comment call can also write to the wrong tracker record.

Edit the learner function. Walk events in order, joining each `tool_result.toolCallId` to its `tool_call.id`. Count search and inspection only when their successful results arrive. The expected issue's read result must arrive after a successful search result and before the `add_comment` call; a read call alone or a result arriving after the write is insufficient. At the comment call, require `arguments.issueId === expectedIssueId`. Independently require exactly one stored comment on that target, no new issues, and unchanged existing records. Both arguments and state must match; prose naming a tool is not execution evidence. Keep challenge fixtures and expectations fixed. Rerun until both valid alternatives and planted failures are classified correctly.

Completion: rerun until every row has `passed: true`, including expected-false cases. Explain one rejected path, one valid alternative, and a novel counterexample. The live suite in `src/evals/triage.eval.ts` retains its simpler search-presence assertion; integrating your stronger grader there is an explicit follow-up, not an automatic consequence of editing the exercise.

## 6 — Clarification is a conversation

Run `npm run lesson -- 6` and open `exercises/conversation.ts`. It prints the same `expected`, `actual`, and `passed` columns as lesson 5, with an intentional initial failure. Inspect `premature-create-same-ending`. These conversations are constructed, so the learner doesn't type follow-ups into a live agent. `output.turns` contains each reply and its tracker snapshot. Reports are incomplete on every turn before the last; the final expectation says whether the last turn supplies enough facts to create or still needs clarification.

The starter grades only the final state. Predict why a premature first-turn write can have exactly the same ending as a correct conversation. Edit the learner function to require observed turns, check every earlier snapshot against the original before state, and retain the final outcome check. Include the middle of a three-turn conversation: checking only the first and last snapshots is insufficient.

Completion: accept delayed creation and continued clarification; reject early issues/comments, interim damage to old records, missing observations, and wrong final outcomes. Rerun until every row has `passed: true` and explain one pair with the same ending but different grades. Question relevance still needs human review.

Keep this lesson offline. Revisit the conversation cases after model setup in lessons 7–8; editing the exercise does not alter the app's live grader.

## 7 — Give the judge one job

Run `npm run lesson -- 7` without a model key. It prints three pairs with `id`, `report`, and `issue`. Compare each issue with its report using one criterion: preserve reproduction facts without invention. Note supporting passages yourself.

Save `.learn-evals/labels.json` using this structure, replacing every empty string with the learner's own `"pass"` or `"fail"` before running the judge:

```json
{
  "pair-01": "",
  "pair-02": "",
  "pair-03": ""
}
```

Use the IDs printed by the checkout. Empty strings are placeholders, not valid labels or supplied answers.

For model calls, copy `.dev.vars.example` to the ignored `.dev.vars` file and add the OpenRouter key there. Then run `npm run evals:judge -- --labels=.learn-evals/labels.json`; the judge does not need the app server. This uses the separate OpenRouter judge model against fixed synthetic outputs. Without your file it compares against reference author labels; don't describe those as learner annotations. The tutor must not send human labels or expected verdicts to the judge.

After the judge command, inspect terminal counts `agreements`, `falseAccepts`, `falseRejects`, and `errors`. Open the printed artifact path: each completed entry in `results` has `human`, `verdict`, `reason`, and `evidence`; error entries have no usable verdict. A zero exit means no execution error, not agreement with the learner. Inspect false accepts and false rejects, not agreement alone. Try `--repeat=3` on the same outputs to expose judge variance. The shipped rubric is already v2: revise `src/evals/judge.ts` only if your evidence reveals an unclear criterion. If everything agrees, leave the rubric alone for now. Save labels for both batches before authoring a new borderline calibration pair: `src/evals/recordings.ts` contains both splits' reference answers, so don't open it while labeling. Don't force a disagreement.

Before reading reference answers or historical captures, run `npm run lesson -- 7 --validation` and save your labels in `.learn-evals/validation-labels.json` using the same object structure with the displayed validation IDs (`pair-04` through `pair-06`). Then run `npm run evals:judge -- --validation --labels=.learn-evals/validation-labels.json`. Keep validation separate from your edits. The supplied validation batch was inspected during v2 development; it is practice data, not an untouched quality estimate. Use fresh cases for an independent check after tuning.

After labels for both batches are saved, ask the tutor for the lesson 7 debrief in [the reference approaches](solutions.md), or run `npm run examples -- judge-disagreement`. That is a historical Nemotron/v1 judge capture, not the current Flash/v2 judge. It is not a failure you must reproduce.

Completion: explain a disagreement with quoted evidence, or challenge the judge with a new borderline pair if it agrees on everything. Keep API/parse errors out of semantic pass/fail counts. No required issue means the quality criterion is inapplicable; a missing required issue is a failed outcome.

## 8 — Run it again

For live trials, start `npm run dev` after configuring `.dev.vars` and leave it running. Run `npm run evals -- --cases=new-search` in another terminal. The trial can pass or fail. Resolve startup/connectivity failures before inspecting reports; completed attempts that fail assertions remain useful evidence.

Run `npm run report`. Compare `planned` with `completed`, then inspect `passed`, `executionErrors`, and `missingArtifacts`. `failed` includes both assertion failures and execution errors; inspect artifacts to tell them apart. `npm run evals:report` prints a local viewer URL for the assertions and transcript. Stop the viewer with Ctrl-C before reusing that terminal, keeping the app server running. Inspect `examples/article-example.ts` to connect this output to the harness and assertions.

To execute that exact example, use `npm run evals:article` with the app running. It runs one live trial and writes `artifacts/article-results.json`, separate from the main suite and its comparisons. Ordinary `npm test` executes the same file using a scripted provider without model API calls.

Return to the main suite and run `npm run evals:repeat -- --cases=new-search`, regardless of whether the first trial passed. Then rerun `npm run report` and open the latest viewer: there should be five planned trials to account for, including failed or incomplete attempts. There are no assertion retries. The app can make multiple model calls per trial; inspect the printed budget first. To stay offline, run `npm run lesson -- 8` for a labeled synthetic variation demonstration.

Optional conversation transfer: with the app running, use `npm run evals -- --cases=clarify-then-create,still-incomplete` and inspect `beforeFinal` and `output.turns` to connect lesson 6 to live per-turn snapshots.

Predict whether one pass means dependable behavior. Preserve all attempts. `pass@k` asks whether at least one of k attempts succeeds; `pass^k` asks whether all succeed. Don't compute these from a pooled success rate across unrelated tasks or assume independent trials without justification.

Completion: explain the question each metric answers and why five runs are an exercise budget.

## 9 — Break the environment

Run `npm run lesson -- 9` and open `exercises/isolation.ts`. It prints failed checks and exits nonzero intentionally. `expected` says whether each isolation check should hold, `actual` is what the factory did, and `passed` compares them. Inspect `different-trial-starts-fresh` alongside `same-trial-retains-writes`: the starter retains A's writes but incorrectly gives them to B too. Repair `learnerTrialStore`. This is a synthetic harness defect and requires no API key.

Predict what happens if you fix it by returning a new tracker on every call: separate trials become clean, but the same conversation forgets its prior turns. Edit the factory so each trial ID retains its own tracker within one store, initialized from the supplied seed. Keep different stores independent too.

Completion: rerun until every row has `passed: true`, covering same-trial continuity, interleaved isolated writes, preserved seed records, unchanged seed input, independent closing, and separate stores. Explain how contamination could turn a new-issue case into an apparent duplicate case.

Then compare with the application's working `src/trials.ts` and inspect timeout/cleanup tests in `tests/http.test.ts`. A timeout is an execution error and a missing artifact is unavailable evidence. Repair the environment and rerun contaminated comparisons before tuning prompts.

## 10 — Make a decision and transfer it

Keep the app running or start it with `npm run dev`. Run `npm run evals -- --cases=new-search,true-duplicate,similar-title --repeat=3`; inspect `npm run report` and `npm run evals:report`. This is nine trials per revision, eighteen for the comparison, potentially several model calls each. Keep the similar-but-different bug in the comparison: improving duplicate detection can also cause incorrect merging. Trial JSON files preserve snapshots and metadata. Change one prompt behavior in `src/policy.ts`, restart the application, and run the same command with models and graders fixed. Reports are archived automatically; `npm run compare` compares the latest two readable archives, shows missing evidence, and refuses an empty comparison. Explicit run IDs let you select another pair. If an expectation was wrong, correct it and rerun both revisions against that criterion. Keep failures as regression cases.

The comparison prints A/B run IDs and one row per case/trial assertion, with `A`/`B` statuses and `A_ms`/`B_ms` durations. Confirm the IDs are the intended pair; the default is the latest two readable archives. A zero exit means planned assertion evidence is present, not that B won. Inspect failed artifacts for execution errors. The blog's fractions are an illustrative aggregation, not the CLI's output format.

Save `.learn-evals/decision.md`: what improved, what regressed, what remains uncertain, and what it cost (unknown cost is not zero). Check correctness before optimizing latency. Test a novel case authored by the learner before looking at reserved examples. Report slices: creating, duplicate handling, clarification, conversation, tool errors, instruction boundary.

Completion: a defensible decision with limits, plus a novel criterion. For another app, switch to apply mode rather than porting the fictional issue policy.
