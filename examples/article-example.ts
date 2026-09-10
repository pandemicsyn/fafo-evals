import { expect } from 'vitest';
import { describeEval } from 'vitest-evals';
import { createTriageHarness } from '../src/evals/harness.ts';
import { newIssues } from '../src/tracker.ts';

const harness = createTriageHarness({ fixture: 'clear-new-report' });

describeEval('filing a new bug', { harness }, (it) => {
  it('creates one issue for a complete report', async ({ run }) => {
    const result = await run(
      'In the issue list, search for a word, then press Escape. ' +
        'Expected: all issues return. Actual: the input clears ' +
        'but the list stays filtered until refresh.',
    );

    const created = newIssues(result.output.before, result.output.after);
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      feature: 'issue-search',
      status: 'open',
    });
  });
});
