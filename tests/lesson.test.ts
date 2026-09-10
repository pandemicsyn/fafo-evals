import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import * as v from 'valibot';
import { expect, it } from 'vitest';
import { parseJson } from '../src/json.ts';

const execute = promisify(execFile);
const lessonScript = fileURLToPath(new URL('../scripts/lesson.ts', import.meta.url));
const learnerPairs = v.array(
  v.strictObject({ id: v.string(), report: v.string(), issue: v.string() }),
);

it.each([
  { flags: [], ids: ['pair-01', 'pair-02', 'pair-03'] },
  { flags: ['--validation'], ids: ['pair-04', 'pair-05', 'pair-06'] },
])('prints an unlabeled view for lesson 7 with $flags', async ({ flags, ids }) => {
  const { stdout } = await execute(
    process.execPath,
    ['--import', import.meta.resolve('tsx'), lessonScript, '7', ...flags],
    { timeout: 10_000 },
  );
  const start = stdout.indexOf('[\n');
  expect(start).toBeGreaterThan(-1);
  // The public payload must contain only neutral IDs and source texts, never author labels.
  const pairs = v.parse(learnerPairs, parseJson(stdout.slice(start)));
  expect(pairs.map((pair) => pair.id)).toEqual(ids);
  expect(pairs.every((pair) => pair.report.length > 0 && pair.issue.length > 0)).toBe(true);
  // Instructions printed before the payload must not contain the old hints or answer-bearing IDs.
  const instructions = stdout.slice(0, start);
  expect(instructions).not.toMatch(
    /\bhint:|faithful-short|missing-zero|invented-browser|Redux|zero matches/i,
  );
});

it('rejects a validation flag outside lesson 7 rather than silently showing the wrong lesson', async () => {
  await expect(
    execute(
      process.execPath,
      ['--import', import.meta.resolve('tsx'), lessonScript, '6', '--validation'],
      { timeout: 10_000 },
    ),
  ).rejects.toMatchObject({ code: 1 });
});
