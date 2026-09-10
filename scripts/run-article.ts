import { loadEnv } from '../src/config.ts';
import { errorMessage } from '../src/json.ts';
import { checkHealth } from './check-health.ts';
import { runNode } from './run-node.ts';

try {
  loadEnv();
  await checkHealth();
  process.exitCode = await runNode([
    'node_modules/vitest/vitest.mjs',
    'run',
    '--config',
    'vitest.article.config.ts',
    ...process.argv.slice(2),
  ]);
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
