import { describe, it, expect } from 'vitest';
import { Tracker } from '../src/tracker.ts';
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
