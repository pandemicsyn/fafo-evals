import { beforeAll, afterAll, vi } from 'vitest';
import { once } from 'node:events';
import { start } from '@flue/runtime/node';
import { fauxProvider, fauxAssistantMessage, fauxToolCall } from '@earendil-works/pi-ai';
import { serve } from '@hono/node-server';
import app from '../src/app.ts';
import { Triage } from '../src/agents/triage.ts';
import { DEFAULT_MODEL } from '../src/config.ts';
import { searchIssue } from '../src/fixtures.ts';

// Execute the exact article test, rather than maintaining a second copy of its assertions.
// The local HTTP app and tools are real; only the provider responses are scripted.
import '../examples/article-example.ts';

const faux = fauxProvider({ provider: 'openrouter', models: [{ id: DEFAULT_MODEL }] });
let runtime: Awaited<ReturnType<typeof start>>;
let server: ReturnType<typeof serve>;

beforeAll(async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'scripted-provider-no-network');
  vi.stubEnv('TRIAGE_MODEL', DEFAULT_MODEL);
  vi.stubEnv('FAFO_SCRIPTED_PROVIDER', '1');
  const { id: _, status: __, ...draft } = searchIssue;
  faux.setResponses([
    fauxAssistantMessage(fauxToolCall('search_issues', { query: 'Escape search' }), {
      stopReason: 'toolUse',
    }),
    fauxAssistantMessage(fauxToolCall('create_issue', draft), { stopReason: 'toolUse' }),
    fauxAssistantMessage('Created ISS-1.'),
  ]);
  runtime = await start({ agents: [Triage], providers: [faux.provider] });
  server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 });
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected a TCP listener.');
  vi.stubEnv('FLUE_URL', `http://127.0.0.1:${address.port}`);
});

afterAll(async () => {
  try {
    await runtime?.stop();
  } finally {
    server?.close();
    vi.unstubAllEnvs();
  }
});
