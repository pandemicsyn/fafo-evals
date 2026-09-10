import { loadComparison, compareAssertions } from '../src/evals/comparison.ts';
import { errorMessage } from '../src/json.ts';
try {
  const { a, b, skipped } = await loadComparison('artifacts/runs', process.argv.slice(2));
  for (const archive of skipped) console.warn(`Skipped unreadable archive: ${archive}`);
  const comparison = compareAssertions(a, b);
  console.log(
    `A: ${a.plan.runId}, model ${a.plan.health.model}\nB: ${b.plan.runId}, model ${b.plan.health.model}`,
  );
  console.table(comparison.rows);
  console.log(`Missing planned assertions: A=${comparison.missingA}, B=${comparison.missingB}.`);
  if (
    comparison.missingA ||
    comparison.missingB ||
    comparison.rows.some((r) => r.A === 'missing' || r.B === 'missing')
  )
    process.exitCode = 1;
  console.log(
    'A failure can be an execution error or an assertion failure: inspect the artifacts. Keep correctness visible before comparing time. Small teaching samples do not establish a general winner.',
  );
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
