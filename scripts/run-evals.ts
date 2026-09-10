import { errorMessage } from '../src/json.ts';
import { checkHealth } from './check-health.ts';
import { runNode } from './run-node.ts';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import { loadEnv } from '../src/config.ts';
import { selectCases } from '../src/evals/cases.ts';
loadEnv();
try {
  const args = process.argv.slice(2);
  const count = Number(args.find((a) => a.startsWith('--repeat='))?.split('=')[1] ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > 5) throw new Error('--repeat must be 1–5.');
  const unknown = args.filter((a) => !/^--(repeat|cases)=/.test(a) && a !== '--all');
  if (unknown.length)
    throw new Error(
      `Unknown arguments: ${unknown.join(', ')}. Use --cases=new-search or --all, optionally --repeat=5.`,
    );
  const ids =
    args.find((a) => a.startsWith('--cases='))?.slice(8) ??
    (args.includes('--all') ? undefined : 'new-search,true-duplicate,missing-observation');
  const selected = selectCases(ids);
  const health = await checkHealth();
  const runId = `run-${randomUUID()}`;
  await mkdir(`artifacts/runs/${runId}`, { recursive: true });
  await rm('artifacts/vitest-results.json', { force: true });
  await writeFile(
    'artifacts/latest-run.json',
    JSON.stringify(
      {
        runId,
        planned: selected.length * count,
        cases: selected.map((c) => c.id),
        repetitions: count,
        health,
        startedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  await copyFile('artifacts/latest-run.json', `artifacts/runs/${runId}/run.json`);
  console.log(
    `${selected.length * count} independent live trials; ${selected.reduce((n, c) => n + c.turns.length * count, 0)} user turns. Each turn may make several model calls. No judge calls in this suite. No assertion retries.`,
  );
  const code = await runNode(
    ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.evals.config.ts'],
    {
      ...process.env,
      FAFO_CASES: selected.map((c) => c.id).join(','),
      FAFO_REPETITIONS: String(count),
      FAFO_RUN_ID: runId,
    },
  );
  process.exitCode = code;
  try {
    await copyFile('artifacts/vitest-results.json', `artifacts/runs/${runId}/vitest-results.json`);
  } catch (cause) {
    // A green child exit is insufficient when the evidence could not be retained.
    console.error(`Run ${runId} could not archive its Vitest report: ${errorMessage(cause)}.`);
    console.error('Inspect partial trial artifacts.');
    process.exitCode = code || 1;
  }
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
