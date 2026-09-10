import { errorMessage } from '../src/json.ts';
import { spawn } from 'node:child_process';
import { loadEnv, requireKey, modelId } from '../src/config.ts';
loadEnv();
try {
  requireKey();
  modelId(process.env.TRIAGE_MODEL);
  console.log('Starting local Flue app at http://127.0.0.1:3583. Tracker writes stay local.');
  const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], {
    stdio: 'inherit',
  });
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => child.kill(signal));
  child.on('exit', (code) => {
    process.exitCode = code ?? 1;
  });
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
