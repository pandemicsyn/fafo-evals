import type { TranscriptEvent } from 'vitest-evals/harness';
import type { TriageOutput } from '../src/evals/grades.ts';

export type DuplicateTrial = {
  events: TranscriptEvent[];
  output: TriageOutput;
  expectedIssueId: string;
};

// LESSON 5 — Catch a meaningful process violation without enforcing one exact script.
// Setup: every synthetic trial should attach one comment to the expected duplicate.
// The starter only checks whether get_issue was called. It ignores success, order, and target.
// Your task: require a successful search, then a successful read of the expected issue,
// then the comment call. Match tool results by toolCallId; failed results do not count.
// Independently check that state gained exactly one comment on that issue, no issues,
// and no changes to existing records. A correct tool argument alone doesn't prove the write.
// Success: accept different queries and candidate-reading orders; reject late/missing/failed
// reads, prose pretending to be a tool, and wrong-target writes. Don't hardcode fixture IDs.
// Run `npm run lesson -- 5`. The initial failure is intentional. Edit this function,
// not the challenge cases. The final reply's wording is irrelevant to this criterion.
export function learnerTrajectory(trial: DuplicateTrial): boolean {
  return trial.events.some((event) => event.type === 'tool_call' && event.name === 'get_issue');
}
