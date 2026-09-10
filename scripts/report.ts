import { readFile, readdir } from 'node:fs/promises';
import * as v from 'valibot';
import { summarizeRun } from '../src/evals/reporting.ts';
import { RunSchema, TrialSummarySchema, ReportSchema } from '../src/evals/schemas.ts';
import { parseJson, errorMessage } from '../src/json.ts';
try {
  const plan = v.parse(RunSchema, parseJson(await readFile('artifacts/latest-run.json', 'utf8')));
  const files = await readdir('artifacts/trials').catch((): string[] => []);
  const trials = (
    await Promise.all(
      files
        .filter((f) => f.startsWith('eval-'))
        .map(async (f) =>
          v.parse(TrialSummarySchema, parseJson(await readFile(`artifacts/trials/${f}`, 'utf8'))),
        ),
    )
  ).filter((t) => t.experimentId === plan.runId);
  const results = v.parse(
    ReportSchema,
    parseJson(await readFile('artifacts/vitest-results.json', 'utf8')),
  );
  const tests = results.testResults.flatMap((s) => s.assertionResults);
  console.table(
    summarizeRun(
      plan.planned,
      trials,
      tests.map((t) => t.status),
    ),
  );
  console.log(
    'Correctness denominator: completed trials. Execution reliability denominator: planned trials. Vitest failed includes assertion failures and execution errors. Missing artifacts are unfinished/error evidence, never passes. Cost is unknown unless provider usage records supply it.',
  );
  console.log('Per-case assertions and transcripts: npm run evals:report');
} catch (error) {
  console.error(
    `Cannot read a complete report: ${errorMessage(error)}. Run npm run evals first. Partial artifacts may remain under artifacts/trials.`,
  );
  process.exitCode = 1;
}
