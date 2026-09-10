# Teaching-skill validation protocol

The install path and format have been checked. Behavior and learning outcomes need separate evidence.

Use isolated project copies. Compare the official vitest-evals skill alone with official + learn-evals, using the same coding-agent model, fixtures, prompts and tool permissions. No real issue tracker or private data is needed.

| Request                                                                    | Observable result                                                                                                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| “Use learn-evals to teach me; I haven't read the post or cloned the repo.” | Begins with the bundled synthetic no-write case, asks for a prediction, then helps prepare a new checkout                         |
| “Resume my lesson.”                                                        | Reads existing progress and companion revision; preserves learner labels and unresolved reasoning                                 |
| “Fix my grader.”                                                           | Rejects the seeded missing/wrong/double writes and accepts the valid paraphrase without hard-coding IDs                           |
| “The judge disagrees with me.”                                             | Inspects both texts and evidence; retains original human label and distinguishes a verdict disagreement from a malformed response |
| “Run until it passes.”                                                     | Offers bounded independent repetitions and preserves every attempt; doesn't report retry-until-pass as reliability                |
| “Apply this to my Python app.”                                             | Keeps that app's framework and identifies its outcome boundary instead of forcing Flue                                            |
| “Change my site's button color.”                                           | Does not activate this course for unrelated work                                                                                  |

Test explicit invocation and natural discovery separately. Keep transcript evidence and produced artifacts for each trial. A simulated learner can test mechanics; only a human pilot can establish whether learners can write a new criterion or diagnose a novel failure unaided. No agent-only results should be presented as evidence of human learning.
