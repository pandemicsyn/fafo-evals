import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import * as v from 'valibot';
import { errorMessage, parseJson } from '../json.ts';
import { ReportSchema, RunIdSchema, RunSchema, type Report, type Run } from './schemas.ts';
type Archive = { plan: Run; report: Report };
async function readArchive(root: string, id: string): Promise<Archive> {
  v.parse(RunIdSchema, id);
  const [planText, reportText] = await Promise.all([
    readFile(join(root, id, 'run.json'), 'utf8'),
    readFile(join(root, id, 'vitest-results.json'), 'utf8'),
  ]);
  const plan = v.parse(RunSchema, parseJson(planText));
  if (plan.runId !== id) throw new Error(`Archive ${id} contains a different run ID.`);
  return { plan, report: v.parse(ReportSchema, parseJson(reportText)) };
}
export async function loadComparison(root: string, ids: string[]) {
  if (ids.length && ids.length !== 2) throw new Error('Provide exactly two run IDs.');
  if (ids.length && ids[0] === ids[1]) throw new Error('Choose two different runs.');
  const skipped: string[] = [];
  let selected: Archive[];
  if (ids.length) {
    // An unrelated interrupted archive must not prevent comparing two explicitly selected runs.
    selected = await Promise.all(ids.map((id) => readArchive(root, id)));
  } else {
    const entries = (await readdir(root, { withFileTypes: true })).filter((e) => e.isDirectory());
    const results = await Promise.allSettled(entries.map((e) => readArchive(root, e.name)));
    const available: Archive[] = [];
    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') available.push(result.value);
      else skipped.push(`${entries[index].name}: ${errorMessage(result.reason)}`);
    }
    selected = available.sort((a, b) => a.plan.startedAt.localeCompare(b.plan.startedAt)).slice(-2);
  }
  const [a, b] = selected;
  if (!a || !b)
    throw new Error(
      `Need two readable archived reports. Skipped ${skipped.length} incomplete or invalid archives.`,
    );
  if (
    JSON.stringify([...a.plan.cases].sort()) !== JSON.stringify([...b.plan.cases].sort()) ||
    a.plan.repetitions !== b.plan.repetitions
  )
    throw new Error(
      'Case sets or repetition counts differ. Rerun matched conditions before comparing.',
    );
  return { a, b, skipped };
}
export function compareAssertions(a: Archive, b: Archive) {
  const index = (report: Report) => {
    const assertions = report.testResults.flatMap((suite) => suite.assertionResults);
    const map = new Map(assertions.map((test) => [test.fullName, test]));
    if (map.size !== assertions.length)
      throw new Error('Duplicate assertion names make this comparison ambiguous.');
    return map;
  };
  const left = index(a.report);
  const right = index(b.report);
  // Use both reports: a case absent from A is missing evidence, not a reason to hide B's result.
  const names = new Set([...left.keys(), ...right.keys()]);
  if (!names.size)
    throw new Error('Neither run contains assertion evidence. Inspect the failed runs.');
  return {
    rows: [...names].map((name) => ({
      case: name,
      A: left.get(name)?.status ?? 'missing',
      B: right.get(name)?.status ?? 'missing',
      A_ms: left.get(name)?.duration ?? null,
      B_ms: right.get(name)?.duration ?? null,
    })),
    missingA: Math.max(0, a.plan.planned - left.size),
    missingB: Math.max(0, b.plan.planned - right.size),
  };
}
