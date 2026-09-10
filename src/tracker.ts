import * as v from 'valibot';

const text = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(4000));
export const IssueInput = v.object({
  // A schema can require these fields; it cannot prove the agent preserved the user's facts.
  title: text,
  feature: v.picklist(['issue-search', 'saved-search-export', 'notifications']),
  reproduction: text,
  expected: text,
  observed: text,
});
export const IssueSchema = v.object({
  ...IssueInput.entries,
  id: text,
  status: v.picklist(['open', 'closed']),
});
export const CommentSchema = v.object({ id: text, issueId: text, body: text });
export const SnapshotSchema = v.object({
  issues: v.array(IssueSchema),
  comments: v.array(CommentSchema),
});
export type IssueDraft = v.InferOutput<typeof IssueInput>;
export type Issue = v.InferOutput<typeof IssueSchema>;
export type Snapshot = v.InferOutput<typeof SnapshotSchema>;
export type Fault = 'none' | 'no-write' | 'wrong-target' | 'search-error';

export class Tracker {
  private state: Snapshot;
  private active = true;
  private calls = 0;
  constructor(
    seed: Snapshot,
    readonly fault: Fault = 'none',
    private readonly maxCalls = 24,
  ) {
    this.state = structuredClone(v.parse(SnapshotSchema, seed));
  }
  snapshot(): Snapshot {
    // Without a copy, later writes could mutate the saved "before" state and corrupt the grader.
    return structuredClone(this.state);
  }
  close() {
    this.active = false;
  }
  private guard() {
    if (!this.active) throw new Error('Trial is closed; late tool calls cannot write.');
    if (++this.calls > this.maxCalls) throw new Error('Trial tool-call budget exhausted.');
  }
  search(query: string) {
    this.guard();
    if (this.fault === 'search-error') throw new Error('Injected tracker search outage.');
    // Deliberately broad retrieval: semantic duplicate decisions belong to the agent.
    const words = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    return this.state.issues
      .filter(
        (issue) =>
          words.length === 0 ||
          words.some((w) =>
            `${issue.title} ${issue.feature} ${issue.reproduction} ${issue.observed}`
              .toLowerCase()
              .includes(w),
          ),
      )
      .map(({ id, title, feature, status }) => ({ id, title, feature, status }));
  }
  get(id: string) {
    this.guard();
    const issue = this.state.issues.find((i) => i.id === id);
    if (!issue) throw new Error(`Issue ${id} does not exist.`);
    return structuredClone(issue);
  }
  create(input: IssueDraft) {
    this.guard();
    const draft = v.parse(IssueInput, input);
    let number = 1;
    while (this.state.issues.some((i) => i.id === `ISS-${number}`)) number++;
    const issue: Issue = { ...draft, id: `ISS-${number}`, status: 'open' };
    // Inject a lying receipt: the tool returns success without persisting anything.
    // This is why evals inspect state instead of trusting the agent or the tool response.
    if (this.fault !== 'no-write') this.state.issues.push(issue);
    return structuredClone(issue);
  }
  comment(issueId: string, body: string) {
    this.guard();
    const parsed = v.parse(v.object({ issueId: text, body: text }), { issueId, body });
    if (!this.state.issues.some((i) => i.id === parsed.issueId))
      throw new Error('Comment target does not exist.');
    const target =
      this.fault === 'wrong-target'
        ? (this.state.issues.find((i) => i.id !== issueId)?.id ?? issueId)
        : issueId;
    const comment = { ...parsed, issueId: target, id: `COM-${this.state.comments.length + 1}` };
    if (this.fault !== 'no-write') this.state.comments.push(comment);
    return structuredClone(comment);
  }
}

export function newIssues(before: Snapshot, after: Snapshot) {
  return after.issues.filter((i) => !before.issues.some((old) => old.id === i.id));
}
export function newComments(before: Snapshot, after: Snapshot) {
  return after.comments.filter((i) => !before.comments.some((old) => old.id === i.id));
}
export function existingRecordsUnchanged(before: Snapshot, after: Snapshot) {
  return (
    before.issues.every(
      (i) => JSON.stringify(i) === JSON.stringify(after.issues.find((j) => j.id === i.id)),
    ) &&
    before.comments.every(
      (i) => JSON.stringify(i) === JSON.stringify(after.comments.find((j) => j.id === i.id)),
    )
  );
}
