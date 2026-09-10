import { isDeepStrictEqual } from 'node:util';
import type { TranscriptEvent } from 'vitest-evals/harness';
import type { DuplicateTrial } from '../../exercises/trajectory.ts';
import type { Expected } from './cases.ts';
import type { TriageOutput } from './grades.ts';
import { fixtures, searchIssue } from '../fixtures.ts';
import { Tracker, type Snapshot } from '../tracker.ts';

// Fixed, synthetic challenge inputs keep learner feedback reproducible and free of model calls.
// Expected answers live here, outside learner functions. Exceptions are checker errors, not
// successful rejections. Keep these cases fixed while solving, then add your own counterexample.
export type ChallengeResult = {
  example: string;
  expected: boolean;
  actual: boolean | 'error';
  passed: boolean;
  error?: string;
};
function check(example: string, expected: boolean, run: () => boolean): ChallengeResult {
  try {
    const actual = run();
    return { example, expected, actual, passed: actual === expected };
  } catch (error) {
    return { example, expected, actual: 'error', passed: false, error: String(error) };
  }
}
function tool(
  id: string,
  name: string,
  args: Record<string, string>,
  ok = true,
): TranscriptEvent[] {
  return [
    { type: 'tool_call', id, name, arguments: args },
    ok
      ? { type: 'tool_result', toolCallId: id, name, content: { ok: true } }
      : { type: 'tool_result', toolCallId: id, name, error: { message: 'Injected outage.' } },
  ];
}
export function checkTrajectory(grade: (trial: DuplicateTrial) => boolean): ChallengeResult[] {
  // IDs differ from the live fixture targets so a solution must use the given expectation.
  const seed = structuredClone(fixtures['existing-issues']);
  seed.issues[0].id = 'ISS-73';
  const target = seed.issues[0].id;
  const other = seed.issues[1].id;
  const tracker = new Tracker(seed);
  const before = tracker.snapshot();
  tracker.comment(target, 'Same trigger and failure.');
  const output = { before, after: tracker.snapshot(), reply: 'Attached.', turns: [] };
  const search = tool('s', 'search_issues', { query: 'Escape issue list' });
  const read = tool('r', 'get_issue', { id: target });
  const write = tool('w', 'add_comment', { issueId: target, body: 'Same report.' });
  const wrongState = structuredClone(output);
  wrongState.after.comments = wrongState.after.comments.map((comment) => ({
    ...comment,
    issueId: other,
  }));
  const scenarios: {
    id: string;
    events: TranscriptEvent[];
    expected: boolean;
    output?: TriageOutput;
  }[] = [
    { id: 'valid-direct', events: [...search, ...read, ...write], expected: true },
    {
      id: 'valid-alternate-path',
      events: [
        ...tool('s2', 'search_issues', { query: 'filter does not clear' }),
        ...tool('r2', 'get_issue', { id: other }),
        ...read,
        ...write,
      ],
      expected: true,
    },
    {
      id: 'valid-other-candidate-after-target',
      events: [...search, ...read, ...tool('r2', 'get_issue', { id: other }), ...write],
      expected: true,
    },
    { id: 'no-search', events: [...read, ...write], expected: false },
    { id: 'read-before-search-only', events: [...read, ...search, ...write], expected: false },
    { id: 'read-after-write', events: [...search, ...write, ...read], expected: false },
    {
      id: 'wrong-candidate-read',
      events: [...search, ...tool('r2', 'get_issue', { id: other }), ...write],
      expected: false,
    },
    {
      id: 'failed-read',
      events: [...search, ...tool('r', 'get_issue', { id: target }, false), ...write],
      expected: false,
    },
    {
      id: 'failed-search',
      events: [...tool('s', 'search_issues', { query: 'Escape' }, false), ...read, ...write],
      expected: false,
    },
    {
      id: 'read-result-too-late',
      events: [...search, read[0], ...write, read[1]],
      expected: false,
    },
    {
      id: 'prose-is-not-a-tool',
      events: [
        { type: 'message', role: 'assistant', content: 'search_issues and get_issue succeeded.' },
        ...write,
      ],
      expected: false,
    },
    {
      id: 'wrong-write-argument',
      events: [...search, ...read, ...tool('w', 'add_comment', { issueId: other })],
      expected: false,
    },
    {
      id: 'right-call-wrong-state',
      events: [...search, ...read, ...write],
      output: wrongState,
      expected: false,
    },
  ];
  return scenarios.map((s) =>
    check(s.id, s.expected, () =>
      grade({
        events: structuredClone(s.events),
        output: structuredClone(s.output ?? output),
        expectedIssueId: target,
      }),
    ),
  );
}

export function checkConversation(
  grade: (output: TriageOutput, expected: Expected) => boolean,
): ChallengeResult[] {
  function sample(seed: Snapshot, early: 'none' | 'issue' | 'comment' = 'none', create = true) {
    const tracker = new Tracker(seed);
    const before = tracker.snapshot();
    if (early === 'issue') tracker.create(searchIssue);
    if (early === 'comment') tracker.comment(seed.issues[0].id, 'Premature report.');
    const first = { reply: 'What happened, and what did you expect?', after: tracker.snapshot() };
    if (create && early !== 'issue') tracker.create(searchIssue);
    return {
      before,
      after: tracker.snapshot(),
      reply: 'Thanks.',
      turns: [first, { reply: 'Thanks.', after: tracker.snapshot() }],
    };
  }
  const valid = sample(fixtures['clear-new-report']);
  const early = sample(fixtures['clear-new-report'], 'issue');
  const damage = sample(fixtures['existing-issues']);
  damage.turns[0].after.issues[0].title = 'Damaged then restored';
  const transientComment = sample(fixtures['existing-issues']);
  transientComment.turns[0].after.comments.push({
    id: 'COM-temp',
    issueId: 'ISS-10',
    body: 'Too soon',
  });
  const threeTurns = structuredClone(valid);
  threeTurns.turns.splice(1, 0, structuredClone(early.turns[0]));
  const scenarios: { id: string; output: TriageOutput; pass: boolean; clarify?: boolean }[] = [
    { id: 'valid-delayed-create', output: valid, pass: true },
    { id: 'valid-seeded-tracker', output: sample(fixtures['existing-issues']), pass: true },
    {
      id: 'valid-still-incomplete',
      output: sample(fixtures['clear-new-report'], 'none', false),
      pass: true,
      clarify: true,
    },
    { id: 'premature-create-same-ending', output: early, pass: false },
    {
      id: 'premature-comment',
      output: sample(fixtures['existing-issues'], 'comment'),
      pass: false,
    },
    { id: 'comment-later-removed', output: transientComment, pass: false },
    { id: 'interim-record-damage', output: damage, pass: false },
    { id: 'middle-turn-write', output: threeTurns, pass: false },
    {
      id: 'missing-final-write',
      output: sample(fixtures['clear-new-report'], 'none', false),
      pass: false,
    },
    { id: 'still-incomplete-but-wrote', output: valid, pass: false, clarify: true },
    { id: 'missing-turn-evidence', output: { ...valid, turns: [] }, pass: false },
  ];
  return scenarios.map((s) =>
    check(s.id, s.pass, () =>
      grade(
        structuredClone(s.output),
        s.clarify ? { action: 'clarify' } : { action: 'create', feature: 'issue-search' },
      ),
    ),
  );
}

export function checkIsolation(
  factory: (seed: Snapshot) => (id: string) => Tracker,
): ChallengeResult[] {
  return [
    check('same-trial-retains-writes', true, () => {
      const get = factory(fixtures['clear-new-report']);
      get('A').create(searchIssue);
      return get('A').snapshot().issues.length === 1;
    }),
    check('different-trial-starts-fresh', true, () => {
      const get = factory(fixtures['clear-new-report']);
      get('A').create(searchIssue);
      return get('B').snapshot().issues.length === 0;
    }),
    check('interleaved-writes-stay-local', true, () => {
      const get = factory(fixtures['clear-new-report']);
      get('A').create(searchIssue);
      get('B').create({ ...searchIssue, title: 'B report' });
      return (
        get('A').snapshot().issues.length === 1 &&
        get('B').snapshot().issues.length === 1 &&
        get('A').snapshot().issues[0].title === searchIssue.title &&
        get('B').snapshot().issues[0].title === 'B report'
      );
    }),
    check('seed-preserved-and-not-mutated', true, () => {
      const seed = structuredClone(fixtures['existing-issues']);
      const original = structuredClone(seed);
      const get = factory(seed);
      get('A').comment(seed.issues[0].id, 'Only A');
      return isDeepStrictEqual(get('B').snapshot(), original) && isDeepStrictEqual(seed, original);
    }),
    check('closing-A-does-not-close-B', true, () => {
      const get = factory(fixtures['clear-new-report']);
      get('A').close();
      get('B').create(searchIssue);
      return get('B').snapshot().issues.length === 1;
    }),
    check('separate-stores-do-not-share-IDs', true, () => {
      const one = factory(fixtures['clear-new-report']);
      const two = factory(fixtures['clear-new-report']);
      one('same-id').create(searchIssue);
      return two('same-id').snapshot().issues.length === 0;
    }),
  ];
}
