import type { TranscriptEvent } from 'vitest-evals/harness';
import type { TriageOutput } from '../src/evals/grades.ts';

export type DuplicateTrial = {
  events: TranscriptEvent[];
  output: TriageOutput;
  expectedIssueId: string;
};

// LESSON 5 — Catch a meaningful process violation without enforcing one exact script.
// Setup: every synthetic trial should attach one comment to the expected duplicate.
// Event contract: a tool_call has id, name, and arguments. search_issues takes { query },
// get_issue takes { id }, and add_comment takes { issueId, body }.
// A tool_result joins the call via toolCallId. Its error field marks a failed result;
// a successful result has content and no error. Don't mark a call successful before its result.
// The starter only checks whether get_issue was called. It ignores success, order, and target.
// Your task: walk events in order, joining tool_result.toolCallId to tool_call.id.
// Require the successful search RESULT, then the expected issue's successful read RESULT,
// before the add_comment CALL. A pending read doesn't count, even if its call came first.
// At that write call, require arguments.issueId === expectedIssueId. Failed results don't count.
// Independently check that state gained exactly one comment on that issue, no issues,
// and no changes to existing records. BOTH the call argument and stored target must match.
// Success: accept different queries and candidate-reading orders; reject late/missing/failed
// reads, prose pretending to be a tool, and wrong-target writes. Don't hardcode fixture IDs.
// Run `npm run lesson -- 5`. The initial failure is intentional. Edit this function,
// not the challenge cases. The final reply's wording is irrelevant to this criterion.
export function learnerTrajectory(trial: DuplicateTrial): boolean {
  return trial.events.some((event) => event.type === 'tool_call' && event.name === 'get_issue');
}
