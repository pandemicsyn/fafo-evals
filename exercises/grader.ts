import type { TriageOutput } from '../src/evals/grades.ts';

// LESSON 3 — Write a grader, not the agent.
// Setup: every example asks for one new, open issue about issue-search. The supplied
// grader is deliberately bad: it trusts a reply containing "created", even with no write.
// Your task: edit this function to check the before/after tracker snapshots instead.
// Success: accept a valid write with different reply wording; reject missing writes,
// the wrong feature, and duplicate writes. Also reject extra comments or changed old records.
// Keep the supplied examples and expected answers unchanged; don't match their IDs or wording.
// Run `npm run lesson -- 3`. Its initial failure is expected; it passes when all challenge
// answers match. Passing covers these examples, not every possible bug or reproduction detail.
export function learnerGrader(output: TriageOutput): boolean {
  return output.reply.toLowerCase().includes('created');
}
