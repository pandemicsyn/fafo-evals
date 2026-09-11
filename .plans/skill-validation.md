# Teaching-skill validation protocol

The install path and format have been checked. Behavior and learning outcomes need separate evidence.

## September 11 project-skill layout

The default onboarding now starts with cloning the repo. The canonical skill is `.agents/skills/learn-evals`; the Claude directory links to it. `npx skills add . --list` discovers exactly one `learn-evals` skill, and the skill validator passes. Copying both hidden directories into a temporary location with relative symlinks preserved resolves the Claude entry point and all three reference files to the canonical content. The lesson CLI loads the moved guide; all 46 companion tests pass. An independent static review found no actionable issues in the layout and onboarding changes. These are filesystem, installer-discovery, and code checks; native client discovery has not been exercised in fresh Codex, Claude Code, and Kilo sessions.

Use isolated project copies. Compare the official vitest-evals skill alone with official + learn-evals, using the same coding-agent model, fixtures, prompts and tool permissions. No real issue tracker or private data is needed.

| Request                                                                    | Observable result                                                                                                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| “Use learn-evals to teach me; I haven't read the post or cloned the repo.” | Explains the app and task, asks one question, and ends the turn without revealing the result; setup can wait                      |
| “Resume my lesson.”                                                        | Reads existing progress and companion revision; preserves learner labels and unresolved reasoning                                 |
| “Fix my grader.”                                                           | Rejects the seeded missing/wrong/double writes and accepts the valid paraphrase without hard-coding IDs                           |
| “The judge disagrees with me.”                                             | Inspects both texts and evidence; retains original human label and distinguishes a verdict disagreement from a malformed response |
| “Run until it passes.”                                                     | Offers bounded independent repetitions and preserves every attempt; doesn't report retry-until-pass as reliability                |
| “Apply this to my Python app.”                                             | Keeps that app's framework and identifies its outcome boundary instead of forcing Flue                                            |
| “Change my site's button color.”                                           | Does not activate this course for unrelated work                                                                                  |

Test explicit invocation and natural discovery separately. Keep transcript evidence and produced artifacts for each trial. A simulated learner can test mechanics; only a human pilot can establish whether learners can write a new criterion or diagnose a novel failure unaided. No agent-only results should be presented as evidence of human learning.

## September 10 reviewer-feedback walkthrough

An independent agent read only lesson 5's prose, starter, reference approach, and public state helpers, then implemented a grader in a temporary file without inspecting checker or test source. Its first attempt rejected all cases: 10/13 classified correctly, but all three valid alternatives failed. This exposed missing event-field and tool-argument documentation. After those contracts were added, a second attempt accepted all three valid paths and rejected all ten violations (13/13). Preserve both observations; this is agent-assisted validation of instructions, not evidence of human learning.

Lesson 7 now uses neutral IDs and separate unlabeled calibration/validation commands. Hints live outside the printable guide. Historical judge results and debriefs come after the learner records both sets of labels. The supplied validation examples remain development-exposed; neutral IDs do not create a pristine holdout. Course version 3 tells the tutor to preserve older labels and prior exposure during migration.

## Lesson 1 tutoring regression

The user's installed-skill transcript skipped the application setup, answered its own prediction immediately, and presented both examples plus a glossary in one response. The revised guide separates orientation, snapshot inspection, and tool-result inspection across learner turns. The shared teaching loop now explicitly requires a turn boundary after a learning question, unless the learner requests the answer or a complete walkthrough.

A fresh independent tutor agent received only the skill path and the learner request, with no description of the suspected failure or desired response. No files were changed or model API calls made by the tutor. Observed conversation:

| Learner message                                                                                       | Tutor behavior                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Use the learn-evals skill to teach me evals, start with lesson 1.”                                   | Defined eval, described the fictional tracker and filing task, explained prepared examples, showed only the report and assistant confirmation, then ended with “What would you check before accepting that the assistant finished the job?” No snapshot, answer, or glossary. |
| “Wait, is the agent supposed to fix the search here? I'm a fullstack dev but haven't built an agent.” | Clarified filing versus fixing and explained tools through an API/database analogy. Repeated the pending question and waited without exposing the result.                                                                                                                     |
| “I'd query the tracker and see whether it saved an issue. I don't have the repo set up yet.”          | Showed the first JSON excerpt, explained reply/snapshots/empty lists, then asked for a verdict without supplying it or requiring setup.                                                                                                                                       |
| “It failed because there are still zero issues after it ran. It just said it created one.”            | Discussed the learner's verdict, introduced tool results and the second example, then stopped at a question about the conflicting evidence.                                                                                                                                   |
| “Show me the answer for this one.”                                                                    | Explained the failure, distinguished the learner's first answer from the tutor-demonstrated second answer, and asked what else to check when an issue exists. Did not claim the lesson was completed.                                                                         |

The static reviewer found a tool-result title in the excerpt that differed from the CLI. It was corrected to the exact CLI title after the tutor trial loaded its reference. The behavior trial used the otherwise identical earlier wording. Formatting, type-aware lint, TypeScript, all 43 deterministic tests, build, and skill-format validation passed. These checks establish the observed tutoring sequence and working course machinery, not human learning outcomes or guaranteed behavior across clients/models.
