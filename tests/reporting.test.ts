import { it, expect } from 'vitest';
import { summarizeRun } from '../src/evals/reporting.ts';
it('keeps skipped and errored executions out of completed-trial correctness', () => {
  expect(
    summarizeRun(
      4,
      [{ execution: 'completed' }, { execution: 'completed' }, { execution: 'error' }],
      ['passed', 'failed', 'failed', 'pending'],
    ),
  ).toMatchObject({
    planned: 4,
    attempted: 3,
    completed: 2,
    passed: 1,
    failed: 2,
    executionErrors: 1,
    skipped: 1,
    missingArtifacts: 1,
    completedTrialPassRate: 0.5,
    executionReliability: 0.5,
  });
  expect(summarizeRun(1, [{ execution: 'error' }], ['failed']).completedTrialPassRate).toBeNull();
});
