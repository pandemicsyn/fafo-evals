import { fixtures, searchIssue, searchReport, exportReport } from '../fixtures.ts';
import { Tracker } from '../tracker.ts';
import type { TriageOutput } from './grades.ts';
export type Recording = {
  id: string;
  provenance: 'synthetic';
  input: string;
  output: TriageOutput;
  trace: { name: string; arguments: unknown; result: unknown }[];
};

// LESSONS 1–3: these are authored counterexamples, not captured model failures. First compare
// the reply, trace, and independent state; then write down a failure and a check that catches it.
// The contrasting valid example matters too: a grader that rejects everything is also broken.
export function recordings(): Recording[] {
  const make = (
    id: string,
    change: (t: Tracker) => void,
    reply: string,
    fault: 'none' | 'no-write' = 'none',
  ): Recording => {
    const t = new Tracker(fixtures['clear-new-report'], fault);
    const before = t.snapshot();
    change(t);
    return {
      id,
      provenance: 'synthetic',
      input: searchReport,
      output: { before, after: t.snapshot(), reply, turns: [] },
      trace: [],
    };
  };
  const { id: _, status: __, ...draft } = searchIssue;
  const records = [
    make('convincing-no-write', () => {}, 'Created ISS-1 with your reproduction steps.'),
    make(
      'lying-tool',
      (t) => {
        t.create(draft);
      },
      'Created ISS-1 with your reproduction steps.',
      'no-write',
    ),
    make(
      'correct-paraphrase',
      (t) => {
        t.create({ ...draft, title: 'Esc leaves the issue list filtered' });
      },
      'Filed ISS-1.',
    ),
    make(
      'wrong-feature',
      (t) => {
        t.create({ ...draft, feature: 'notifications' });
      },
      'Created ISS-1.',
    ),
    make(
      'double-write',
      (t) => {
        t.create(draft);
        t.create(draft);
      },
      'Created ISS-1 and ISS-2.',
    ),
    make(
      'missing-trigger',
      (t) => {
        t.create({ ...draft, reproduction: 'Use issue search.' });
      },
      'Created ISS-1.',
    ),
  ];
  records[1].trace = [
    { name: 'create_issue', arguments: draft, result: { ...draft, id: 'ISS-1', status: 'open' } },
  ];
  // A tool receipt can lie; the independently read tracker is the outcome evidence.
  return records;
}
// LESSON 7: use `npm run lesson -- 7` for an unlabeled view before reading the author labels.
// Tune on calibration pairs, then inspect validation separately. Once used to revise a rubric,
// a validation example is development data; it no longer gives an untouched check of that revision.
export const calibrationExamples = [
  {
    id: 'faithful-short',
    split: 'calibration',
    report: exportReport,
    issue:
      'Saved-search export with zero matches spins forever without downloading. Expected a CSV containing column headers.',
    human: 'pass',
  },
  {
    id: 'missing-zero',
    split: 'calibration',
    report: exportReport,
    issue:
      'Saved-search export sometimes hangs. Expected a CSV with headers, but the spinner never stops.',
    human: 'fail',
  },
  {
    id: 'invented-browser',
    split: 'calibration',
    report: exportReport,
    issue:
      'In Firefox 142, export a saved search with zero matches. Spinner never stops; expected a CSV with headers.',
    human: 'fail',
  },
  {
    id: 'faithful-search',
    split: 'validation',
    report: searchReport,
    issue:
      'Type in issue-list search and hit Escape. The input empties but the results remain filtered until reload. Expected the filter and input to clear and all issues to return.',
    human: 'pass',
  },
  {
    id: 'invented-fix',
    split: 'validation',
    report: searchReport,
    issue:
      'Issue search remains filtered after Escape clears the typed term; refresh resets it. Expected all issues. Cause: stale Redux selector; fixed by replacing the reducer.',
    human: 'fail',
  },
  {
    id: 'wrong-observation',
    split: 'validation',
    report: searchReport,
    issue:
      'Type a term in issue search and hit Escape. Expected all issues and empty input; actual input remains filled and results clear.',
    human: 'fail',
  },
] as const;
