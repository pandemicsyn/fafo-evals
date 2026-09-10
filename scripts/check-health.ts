import * as v from 'valibot';
import { localBaseUrl } from '../src/config.ts';
import { HealthSchema } from '../src/evals/schemas.ts';
import { errorMessage } from '../src/json.ts';

// Both live entry points check startup before launching Vitest or replacing reports.
export async function checkHealth() {
  const response = await fetch(`${localBaseUrl()}/health`, {
    signal: AbortSignal.timeout(3000),
  }).catch((cause: unknown) => {
    throw new Error(
      `Cannot reach the local Flue app: ${errorMessage(cause)}. Start it with npm run dev in another terminal.`,
      { cause },
    );
  });
  if (!response.ok) throw new Error(`Server health check returned HTTP ${response.status}.`);
  const health = v.parse(HealthSchema, await response.json());
  if (!health.credentialsConfigured)
    throw new Error('The app needs OPENROUTER_API_KEY in .dev.vars.');
  return health;
}
