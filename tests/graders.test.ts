import { it, expect } from 'vitest';
import { recordings } from '../src/evals/recordings.ts';
import { gradeOutcome, issueQualityApplicability } from '../src/evals/grades.ts';
import { Tracker } from '../src/tracker.ts';
import { fixtures } from '../src/fixtures.ts';
it('rejects planted state failures and accepts a valid paraphrase', () => {
  for (const recording of recordings()) {
    const passed = gradeOutcome(recording.output, {
      action: 'create',
      feature: 'issue-search',
    }).every((g) => g.status === 'pass');
    expect(passed, recording.id).toBe(
      ['correct-paraphrase', 'missing-trigger'].includes(recording.id),
    );
  }
  // Missing-trigger deliberately passes structural checks: this is why semantic review exists.
});
it('rejects a comment on the wrong duplicate even when its tool succeeded', () => {
  const t = new Tracker(fixtures['existing-issues'], 'wrong-target');
  const before = t.snapshot();
  t.comment('ISS-10', 'same bug');
  const output = { before, after: t.snapshot(), reply: 'Commented.', turns: [] };
  expect(
    gradeOutcome(output, { action: 'comment', issueId: 'ISS-10' }).some((g) => g.status === 'fail'),
  ).toBe(true);
});
it('does not skip a missing required issue', () => {
  const output = recordings()[0].output;
  expect(
    issueQualityApplicability(output, { action: 'create', feature: 'issue-search' }).status,
  ).toBe('fail');
  expect(issueQualityApplicability(output, { action: 'clarify' }).status).toBe('not_applicable');
});
