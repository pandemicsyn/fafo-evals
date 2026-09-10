import { errorMessage } from '../src/json.ts';
import { runNode } from './run-node.ts';
import { loadEnv, requireKey, modelId } from '../src/config.ts';
loadEnv();
try {
  requireKey();
  modelId(process.env.TRIAGE_MODEL);
  console.log('Starting local Flue app at http://127.0.0.1:3583. Tracker writes stay local.');
  process.exitCode = await runNode(['node_modules/vite/bin/vite.js', '--host', '127.0.0.1']);
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
