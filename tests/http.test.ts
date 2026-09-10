import * as v from 'valibot';
import { AllocationSchema } from '../src/evals/schemas.ts';
import { SnapshotSchema } from '../src/tracker.ts';
import { beforeAll, afterAll, it, expect, vi } from 'vitest';
import { start } from '@flue/runtime/node';
import { fauxProvider, fauxAssistantMessage, fauxToolCall } from '@earendil-works/pi-ai';
import { serve } from '@hono/node-server';
import { createFlueClient } from '@flue/sdk';
import { once } from 'node:events';
import app from '../src/app.ts';
import { Triage } from '../src/agents/triage.ts';
import { control, transcript, createTriageHarness } from '../src/evals/harness.ts';
import { trackerFor } from '../src/trials.ts';
import type { JsonValue } from 'vitest-evals/harness';
import { searchIssue, searchReport } from '../src/fixtures.ts';
const faux = fauxProvider({
  provider: 'openrouter',
  models: [{ id: 'nvidia/nemotron-3-super-120b-a12b:free' }],
});
let runtime: Awaited<ReturnType<typeof start>>;
let server: ReturnType<typeof serve>;
let base: string;
beforeAll(async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'faux-provider-no-network');
  runtime = await start({ agents: [Triage], providers: [faux.provider] });
  server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 });
  await once(server, 'listening');
  const address = server.address();
  base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
});
afterAll(async () => {
  await runtime?.stop();
  server?.close();
  vi.unstubAllEnvs();
});
it('runs real Flue tools over HTTP with a scripted provider and isolated snapshots', async () => {
  const { id: _, status: __, ...draft } = searchIssue;
  faux.setResponses([
    fauxAssistantMessage(fauxToolCall('search_issues', { query: 'search' }), {
      stopReason: 'toolUse',
    }),
    fauxAssistantMessage(fauxToolCall('create_issue', draft), { stopReason: 'toolUse' }),
    fauxAssistantMessage('Created ISS-1.'),
  ]);
  const a = v.parse(
    AllocationSchema,
    await control(base, '', {
      method: 'POST',
      body: JSON.stringify({ fixture: 'clear-new-report' }),
    }),
  );
  const b = v.parse(
    AllocationSchema,
    await control(base, '', {
      method: 'POST',
      body: JSON.stringify({ fixture: 'clear-new-report' }),
    }),
  );
  const client = createFlueClient({ url: `${base}/agents/triage/${a.id}` });
  try {
    const admission = await client.send({ message: { kind: 'user', body: searchReport } });
    await client.wait(admission, { signal: AbortSignal.timeout(8000) });
    const events = transcript((await client.history()).messages);
    expect(events.some((e) => e.type === 'tool_call' && e.name === 'create_issue')).toBe(true);
    expect(v.parse(SnapshotSchema, await control(base, `/${a.id}`)).issues).toHaveLength(1);
    expect(v.parse(SnapshotSchema, await control(base, `/${b.id}`)).issues).toHaveLength(0);
    faux.setResponses([fauxAssistantMessage('What happened when you tried that?')]);
    const next = await client.send({ message: { kind: 'user', body: 'Another thing is broken.' } });
    await client.wait(next, { signal: AbortSignal.timeout(8000) });
    expect(v.parse(SnapshotSchema, await control(base, `/${a.id}`)).issues).toHaveLength(1);
  } finally {
    await control(base, `/${a.id}`, { method: 'DELETE' });
    await control(base, `/${b.id}`, { method: 'DELETE' });
  }
});
it('rejects arbitrary contexts, missing keys, and cross-origin writes', async () => {
  const missing = await fetch(`${base}/agents/triage/invented`, { method: 'POST', body: '{}' });
  expect(missing.status).toBe(400);
  const cross = await fetch(`${base}/__eval/trials`, {
    method: 'POST',
    headers: { origin: 'https://example.com' },
    body: '{}',
  });
  expect(cross.status).toBe(403);
});
it('normalizes object outputs and closes both overlapping harness trials', async () => {
  faux.setResponses([fauxAssistantMessage('What happens?'), fauxAssistantMessage('What happens?')]);
  const contexts = [0, 1].map(() => {
    const artifacts: Record<string, JsonValue> = {};
    return {
      artifacts,
      setArtifact: (name: string, value: JsonValue) => {
        artifacts[name] = value;
      },
    };
  });
  const harness = createTriageHarness({
    fixture: 'clear-new-report',
    baseUrl: base,
    evidence: 'scripted-provider',
  });
  const [a, b] = await Promise.all(
    contexts.map((context) => harness.run('Search broke.', context)),
  );
  expect(a.output.after.issues).toHaveLength(0);
  expect(b.output.after.issues).toHaveLength(0);
  const ids = contexts.map(
    (context) => v.parse(v.object({ trialId: v.string() }), context.artifacts.trial).trialId,
  );
  expect(ids[0]).not.toBe(ids[1]);
  for (const id of ids) expect(() => trackerFor(id)).toThrow('Unknown');
});
it('preserves timeout evidence and invalidates the tracker before late work can write', async () => {
  faux.setResponses([
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return fauxAssistantMessage('Too late.');
    },
  ]);
  const artifacts: Record<string, JsonValue> = {};
  const harness = createTriageHarness({
    fixture: 'clear-new-report',
    baseUrl: base,
    timeoutMs: 80,
    evidence: 'scripted-provider',
  });
  await expect(
    harness.run('Search broke.', {
      artifacts,
      setArtifact: (name, value) => {
        artifacts[name] = value;
      },
    }),
  ).rejects.toThrow();
  const trial = v.parse(
    v.object({ trialId: v.string(), execution: v.string(), output: v.unknown() }),
    artifacts.trial,
  );
  expect(trial.execution).toBe('error');
  expect(trial.output).toBeDefined();
  expect(() => trackerFor(trial.trialId)).toThrow('Unknown');
});

it('records cleanup failure without hiding an earlier application error', async () => {
  for (const failSnapshot of [false, true]) {
    faux.setResponses([fauxAssistantMessage('What happens when you search?')]);
    const artifacts: Record<string, JsonValue> = {};
    const realFetch = globalThis.fetch;
    const mock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.startsWith(`${base}/__eval/trials/`)) {
        if (init?.method === 'DELETE') {
          await realFetch(input, init); // Close the real tracker; simulate a lost cleanup acknowledgment.
          return new Response('cleanup acknowledgment lost', { status: 503 });
        }
        if (failSnapshot) return new Response('primary snapshot failure', { status: 502 });
      }
      return realFetch(input, init);
    });
    try {
      const harness = createTriageHarness({
        fixture: 'clear-new-report',
        baseUrl: base,
        evidence: 'scripted-provider',
      });
      await expect(
        harness.run('Search broke.', {
          artifacts,
          setArtifact: (name, value) => {
            artifacts[name] = value;
          },
        }),
      ).rejects.toThrow(failSnapshot ? 'primary snapshot failure' : 'Trial cleanup failed');
      const artifact = v.parse(
        v.object({
          trialId: v.string(),
          execution: v.string(),
          applicationExecution: v.string(),
          error: v.string(),
          cleanup: v.object({ status: v.string(), error: v.string() }),
        }),
        artifacts.trial,
      );
      expect(artifact.execution).toBe('error');
      expect(artifact.applicationExecution).toBe(failSnapshot ? 'error' : 'completed');
      expect(artifact.cleanup.status).toBe('error');
      expect(artifact.cleanup.error).toContain('cleanup acknowledgment lost');
      expect(artifact.error).toContain(
        failSnapshot ? 'primary snapshot failure' : 'Trial cleanup failed',
      );
      expect(() => trackerFor(artifact.trialId)).toThrow('Unknown');
    } finally {
      mock.mockRestore();
    }
  }
});
