import { existingRecordsUnchanged, newComments, newIssues, type Snapshot } from '../tracker.ts';
import type { Expected } from './cases.ts';
export type TriageOutput = {
  reply: string;
  before: Snapshot;
  after: Snapshot;
  turns: { reply: string; after: Snapshot }[];
};
export type Criterion = {
  name: string;
  status: 'pass' | 'fail' | 'not_applicable' | 'error';
  reason: string;
};
const check = (name: string, passed: boolean, reason: string): Criterion => ({
  name,
  status: passed ? 'pass' : 'fail',
  reason,
});
export function gradeOutcome(output: TriageOutput, expected: Expected): Criterion[] {
  // Grade state changes, not persuasive replies. ID differences also work with seeded trackers.
  const created = newIssues(output.before, output.after);
  const comments = newComments(output.before, output.after);
  const grades = [
    // The requested write can succeed while unrelated records get damaged. Check both.
    check(
      'existing-records',
      existingRecordsUnchanged(output.before, output.after),
      'Existing issues and comments must remain unchanged.',
    ),
  ];
  if (expected.action === 'create') {
    // These checks establish structure and routing, not whether the reproduction is faithful.
    // The missing-trigger example deliberately passes here; that is the semantic grader's job.
    grades.push(
      check(
        'create-one',
        created.length === 1 && comments.length === 0,
        'Exactly one new issue and no new comments.',
      ),
    );
    grades.push(
      check(
        'feature-and-status',
        created.length === 1 &&
          created[0].feature === expected.feature &&
          created[0].status === 'open',
        `The issue must be open and about ${expected.feature}.`,
      ),
    );
  } else if (expected.action === 'comment') {
    grades.push(
      check(
        'comment-on-duplicate',
        created.length === 0 && comments.length === 1 && comments[0].issueId === expected.issueId,
        `Exactly one comment on ${expected.issueId}, with no new issue.`,
      ),
    );
  } else {
    grades.push(
      check(
        'no-write',
        created.length === 0 && comments.length === 0,
        'No issue or comment should be written.',
      ),
    );
    // A nonempty reply is only a structural guard. Human review checks whether it asks the missing fact.
    grades.push(
      check(
        'reply-present',
        output.reply.trim().length > 0,
        'The user needs a response; relevance still requires human review.',
      ),
    );
  }
  return grades;
}
export function issueQualityApplicability(output: TriageOutput, expected: Expected): Criterion {
  // Skip quality only when no issue was required. A missing required issue is a failure, not a skip.
  if (expected.action !== 'create')
    return {
      name: 'reproduction-fidelity',
      status: 'not_applicable',
      reason: 'No new issue was required.',
    };
  if (newIssues(output.before, output.after).length !== 1)
    return {
      name: 'reproduction-fidelity',
      status: 'fail',
      reason: 'The required single issue is missing or ambiguous.',
    };
  return {
    name: 'reproduction-fidelity',
    status: 'error',
    reason:
      'Needs a human or calibrated judge; deterministic checks do not establish semantic fidelity.',
  };
}
