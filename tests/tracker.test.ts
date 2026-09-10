import { describe, it, expect } from 'vitest';
import { Tracker, newComments, type Fault } from '../src/tracker.ts';
import { fixtures, searchIssue } from '../src/fixtures.ts';
import { allocateTrial, closeTrial, trackerFor } from '../src/trials.ts';
describe('tracker and trial boundaries', () => {
  it('rejects incomplete schema and nonexistent comment targets', () => {
    const t = new Tracker(fixtures['clear-new-report']);
    expect(() => t.create({ ...searchIssue, observed: '' })).toThrow();
    expect(() => t.comment('missing', 'report')).toThrow();
    expect(t.snapshot().issues).toHaveLength(0);
  });
  it('copies snapshots and prevents writes after cleanup', () => {
    const t = new Tracker(fixtures['existing-issues']);
    t.snapshot().issues.pop();
    expect(t.snapshot().issues).toHaveLength(2);
    t.close();
    expect(() => t.create(searchIssue)).toThrow('closed');
  });
  it.each<{ fault: Fault; target: string }>([
    { fault: 'none', target: 'ISS-10' },
    { fault: 'wrong-target', target: 'ISS-20' },
  ])('uses the validated comment target in $fault mode', ({ fault, target }) => {
    const tracker = new Tracker(fixtures['existing-issues'], fault);
    const comment = tracker.comment(' ISS-10 ', ' Same report. ');
    expect(comment).toMatchObject({ issueId: target, body: 'Same report.' });
    expect(tracker.snapshot().comments).toEqual([comment]);
  });
  it('allocates a new comment ID when seeded IDs contain gaps', () => {
    const tracker = new Tracker({
      ...fixtures['existing-issues'],
      comments: [{ id: 'COM-2', issueId: 'ISS-10', body: 'Earlier report.' }],
    });
    const before = tracker.snapshot();
    const first = tracker.comment('ISS-10', 'Another report.');
    const second = tracker.comment('ISS-10', 'One more report.');
    expect(newComments(before, tracker.snapshot())).toEqual([first, second]);
    expect(new Set(tracker.snapshot().comments.map((comment) => comment.id)).size).toBe(3);
    expect(tracker.snapshot().comments[0]).toEqual(before.comments[0]);
  });
  it('keeps simultaneous trial namespaces independent', async () => {
    const a = allocateTrial('clear-new-report');
    const b = allocateTrial('clear-new-report');
    try {
      await Promise.all([
        Promise.resolve().then(() => trackerFor(a).create(searchIssue)),
        Promise.resolve().then(() => expect(trackerFor(b).snapshot().issues).toHaveLength(0)),
      ]);
      expect(trackerFor(a).snapshot().issues).toHaveLength(1);
      expect(trackerFor(b).snapshot().issues).toHaveLength(0);
    } finally {
      closeTrial(a);
      closeTrial(b);
    }
  });
  it('retrieval permits similar titles without declaring duplicates', () => {
    const t = new Tracker(fixtures['similar-title']);
    expect(t.search('export')).toHaveLength(1);
    expect(t.get('ISS-20').observed).toContain('truncates');
  });
});
