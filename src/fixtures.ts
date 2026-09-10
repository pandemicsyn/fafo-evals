import type { Issue, Snapshot } from './tracker.ts';

export const searchIssue: Issue = {
  id: 'ISS-10',
  title: 'Escape clears search text but leaves results filtered',
  feature: 'issue-search',
  reproduction: 'Type a search term in the issue list, then press Escape.',
  expected: 'Search clears and all issues return.',
  observed: 'Text clears but results stay filtered until refresh.',
  status: 'open',
};
export const exportIssue: Issue = {
  id: 'ISS-20',
  title: 'Search export fails',
  feature: 'saved-search-export',
  reproduction: 'Export a saved search with zero matching issues.',
  expected: 'Download a CSV containing column headers.',
  observed: 'Export spins forever and never downloads.',
  status: 'open',
};
export const fixtures = {
  'clear-new-report': { issues: [], comments: [] },
  'existing-issues': { issues: [searchIssue, exportIssue], comments: [] },
  'closed-duplicate': { issues: [{ ...searchIssue, status: 'closed' as const }], comments: [] },
  'similar-title': {
    issues: [
      {
        ...exportIssue,
        reproduction: 'Export a saved search with more than 1000 matching issues.',
        observed: 'CSV downloads but truncates after 1000 rows.',
      },
    ],
    comments: [],
  },
} satisfies Record<string, Snapshot>;
export type Fixture = keyof typeof fixtures;
export const searchReport =
  'In the issue list, type a word into search and press Escape. Expected: search clears and all issues return. Actual: the input clears, but the list stays filtered until I refresh.';
export const exportReport =
  'Export a saved search with zero matching issues. Expected: a CSV with column headers. Actual: the spinner runs forever and no file downloads.';
