# Verification notes

Live observations checked September 9, 2026; engineering checks updated September 10 (America/Chicago). These are implementation smoke tests, not a representative benchmark or a claim of dependable autonomous triage.

## Live observations

| Model / exercise                                        | Result                                                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Nemotron 3 Super `:free`, initial six core triage cases | 6/6 passed deterministic criteria                                                              |
| Same free model, full 11-case teaching suite            | 10 passed, 1 failed; 11 completed, no execution errors or missing artifacts; about 192 seconds |
| Same free model, judge rubric v1 calibration            | 3/3 agreed with reference author labels                                                        |
| Same free model, judge rubric v1 validation             | 1 agreement, 1 false acceptance, 1 evidence-format error                                       |
| GLM 5.3 Flash, judge rubric v1 validation               | 3 evidence-format errors; no usable grades                                                     |
| GLM 5.3 Flash, judge rubric v2 calibration              | 3/3 agreed, no errors                                                                          |
| GLM 5.3 Flash, judge rubric v2 validation               | 3/3 agreed, no errors                                                                          |

The free model's actual failure was **search-outage**: after the tool reported an injected search error, it created an issue anyway. The no-write grader correctly failed it. Run `npm run examples -- search-outage` for the captured evidence. Do not weaken the expectation to make this green. A tutorial can use an imperfect model and make its failure instructive.

Human inspection also found clarification replies that asked again for some already-supplied facts. The structural no-write check passes these replies; it doesn't establish question relevance. This is an explicit limit of those graders, and useful material for a new learner-authored criterion.

The free judge accepted an invented root cause/fix. Run `npm run examples -- judge-disagreement` for that captured result. Its other error involved evidence text that wasn't an exact substring of the source. Flash initially had the same **output-format** problem: it put labels and commentary around supporting quotes. These were unusable grades, not necessarily incorrect semantic verdicts.

Rubric v2 separates `source` and `quote` and explicitly requires a bare exact substring. The semantic criterion stayed unchanged. Earlier failed trials are retained in this record; the validation examples were inspected during development, so the subsequent results are **not a pristine held-out quality estimate**. Use a fresh labeled batch before making deployment decisions.

OpenRouter reported **$0.0006965471 total** for the six Flash v2 judge calls ($0.0003309318 calibration + $0.0003656153 validation). Rates/routing can change; this is the cost of these six short calls, not a promise of future pricing. Application smoke tests used the free endpoint. Application artifacts retain runtime catalog estimates; they aren't billed-cost measurements.

Default decision: free Nemotron for the application so the initial live lessons cost no model tokens at currently listed rates; Flash for the optional semantic judge. Rate limits and availability still apply. Both IDs can be changed in `.dev.vars`. Flash remains an application upgrade candidate; its application behavior has not been benchmarked here.

## Engineering checks

- Clean `npm ci` succeeded in the user-provided checkout.
- Final `npm run verify` passed under Node 22.20.0 and Node 26.4.0: Oxfmt, type-aware Oxlint, TypeScript, all 38 deterministic tests across twelve files, and the Flue Node build. Lint rules reject explicit `any`, unsafe inferred flows, non-null assertions, unnecessary type assertions, accumulating spreads, and mishandled promises; Valibot validates JSON boundaries.
- Deterministic tests exercise real Flue/SDK HTTP calls using a scripted provider, independent and overlapping namespaces, multi-turn continuity, timeout cleanup, malformed tool input, bad/valid grader examples, judge errors/evidence validation, and report denominators.
- Offline examples and all four intentionally failing starters (lessons 3, 5, 6, 9) execute without credentials. Reference solutions pass their checkers; the checkers reject meaningful shortcuts.
- Independent Astra static review identified JSON typing, missing comparison rows, interrupted archive handling, and cleanup error precedence. These were fixed with regression coverage; the bounded second pass found no material remaining defects.
- A subsequent [TypeScript review](../.plans/typescript-review.md) tightened known types and fixed archival exit status, normalized comment targets, and seeded comment-ID collisions. Independent re-review of the fixes reported no actionable issues remaining before commit.
- Reviewer feedback led to neutral judge-pair IDs, unlabeled views for both splits, delayed answer-bearing debriefs, and explicit lesson-5 event/argument contracts. CLI regression tests cover the labeling boundary. A separate agent implemented lesson 5 from the revised prose without reading checker source and passed 13/13 cases; this is a bounded walkthrough, not a human learning study.
- The exact `examples/article-example.ts` executes in the deterministic suite with a scripted provider and real local HTTP/tools; its artifacts retain that provenance. The separate `npm run evals:article` config discovers that file for an opt-in live run and loads `.dev.vars`; a regression test covers its server override. No live-model call was needed for this validation.
- The report viewer loaded all 11 live cases; the count report retained the failed case and showed zero missing artifacts.
- The `skills` installer discovered and installed `learn-evals` into an isolated project for Codex. Skill frontmatter validation passed. Global agent configuration was not changed.
- `.dev.vars` and `.dev.vars.*` are ignored, with `.dev.vars.example` explicitly included. The maintainer's key was loaded from outside the repository for live checks, never copied into source or examples.

## Remaining publication checks

- Merge the companion PR before publishing the article so default-branch clone and skill installation resolve to the lesson files.
- Run the configured Linux/macOS CI matrix after pushing. Local checks used macOS; don't claim Windows validation.
- Pilot the skill with human learners and compare official vitest-evals skill alone against official + teaching skill. Installer validation is not evidence of learning effectiveness.
- Test exact slash-command UI behavior for each client advertised. Codex installation is verified; don't promise universal slash syntax.
- Publish the post after the companion merge. Its current Markdown renders, lesson order and command names have been checked, and the live example matches the typechecked source. Illustrative metrics remain explicitly labeled. The post stays a draft during review.
