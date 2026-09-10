import { expect, it } from 'vitest';
import type { TranscriptEvent } from 'vitest-evals/harness';
import { checkTrajectory, checkConversation, checkIsolation } from '../src/evals/challenges.ts';
import { gradeOutcome } from '../src/evals/grades.ts';
import { Tracker } from '../src/tracker.ts';

// These reference implementations verify the exercise checker, not the learner's current edits.
// Ordinary npm test must stay green while the intentionally broken starters are being solved.
it('trajectory challenge accepts a general state-and-process solution and catches shortcuts', () => {
  const results = checkTrajectory(({ events, output, expectedIssueId }) => {
    const calls = new Map<string, Extract<TranscriptEvent, { type: 'tool_call' }>>();
    let searched = false;
    const inspected = new Set<string>();
    let validWrite = false;
    for (const event of events) {
      if (event.type === 'tool_call') {
        calls.set(event.id, event);
        if (event.name === 'add_comment' && event.arguments?.issueId === expectedIssueId)
          validWrite = searched && inspected.has(expectedIssueId);
      }
      if (event.type !== 'tool_result' || event.error) continue;
      const call = calls.get(event.toolCallId);
      if (call?.name === 'search_issues') searched = true;
      if (call?.name === 'get_issue' && searched && typeof call.arguments?.id === 'string')
        inspected.add(call.arguments.id);
    }
    return (
      validWrite &&
      gradeOutcome(output, { action: 'comment', issueId: expectedIssueId }).every(
        (g) => g.status === 'pass',
      )
    );
  });
  expect(results.filter((r) => !r.passed)).toEqual([]);
  expect(checkTrajectory(() => true).some((r) => !r.passed)).toBe(true);
  expect(checkTrajectory(() => false).some((r) => !r.passed)).toBe(true);
  const presenceOnly = checkTrajectory(({ events }) =>
    events.some((e) => e.type === 'tool_call' && e.name === 'get_issue'),
  );
  expect(presenceOnly.find((r) => r.example === 'read-after-write')?.passed).toBe(false);
  expect(presenceOnly.find((r) => r.example === 'right-call-wrong-state')?.passed).toBe(false);
});

it('conversation challenge requires every intermediate snapshot as well as the final outcome', () => {
  const results = checkConversation(
    (output, expected) =>
      output.turns.length > 0 &&
      output.turns
        .slice(0, -1)
        .every((turn) =>
          gradeOutcome({ ...output, ...turn }, { action: 'clarify' }).every(
            (g) => g.status === 'pass',
          ),
        ) &&
      gradeOutcome(output, expected).every((g) => g.status === 'pass'),
  );
  expect(results.filter((r) => !r.passed)).toEqual([]);
  const endingOnly = checkConversation((output, expected) =>
    gradeOutcome(output, expected).every((g) => g.status === 'pass'),
  );
  for (const name of [
    'premature-create-same-ending',
    'middle-turn-write',
    'interim-record-damage',
    'comment-later-removed',
    'missing-turn-evidence',
  ])
    expect(endingOnly.find((r) => r.example === name)?.passed, name).toBe(false);
});

it('isolation challenge accepts per-store trial state and rejects both sharing and resetting', () => {
  expect(
    checkIsolation((seed) => {
      const trackers = new Map<string, Tracker>();
      return (id) => {
        if (!trackers.has(id)) trackers.set(id, new Tracker(seed));
        return trackers.get(id)!;
      };
    }).filter((r) => !r.passed),
  ).toEqual([]);
  const shared = checkIsolation((seed) => {
    const tracker = new Tracker(seed);
    return () => tracker;
  });
  expect(shared.find((r) => r.example === 'different-trial-starts-fresh')?.passed).toBe(false);
  const reset = checkIsolation((seed) => () => new Tracker(seed));
  expect(reset.find((r) => r.example === 'same-trial-retains-writes')?.passed).toBe(false);
});

it('a learner exception is visible as an error, never a correct negative grade', () => {
  const results = checkTrajectory(() => {
    throw new Error('Broken learner code');
  });
  expect(
    results.every(
      (r) => r.actual === 'error' && !r.passed && r.error?.includes('Broken learner code'),
    ),
  ).toBe(true);
});
