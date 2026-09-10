import { createAgentRouter } from '@flue/runtime/routing';
import { Hono } from 'hono';
import * as v from 'valibot';
import { Triage } from './agents/triage.ts';
import { fixtures } from './fixtures.ts';
import { allocateTrial, closeTrial, trackerFor } from './trials.ts';
import { modelId } from './config.ts';
import { POLICY_VERSION } from './policy.ts';
import { registerCourseProvider } from './provider.ts';

registerCourseProvider();

const app = new Hono();
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))
    return c.json({ error: 'Local lesson server only.' }, 403);
  const origin = c.req.header('origin');
  if (origin && origin !== url.origin)
    return c.json({ error: 'Cross-origin requests are disabled.' }, 403);
  await next();
});
app.get('/', (c) =>
  c.text(
    'FAFO evals: local issue-triage app. In another terminal: npm run evals. No real GitHub issues are modified.',
  ),
);
app.get('/health', (c) =>
  c.json({
    ready: true,
    model: modelId(process.env.TRIAGE_MODEL),
    policyVersion: POLICY_VERSION,
    credentialsConfigured: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
  }),
);
const TrialInput = v.object({
  fixture: v.picklist(
    Object.keys(fixtures) as [keyof typeof fixtures, ...Array<keyof typeof fixtures>],
  ),
  fault: v.optional(v.picklist(['none', 'no-write', 'wrong-target', 'search-error']), 'none'),
});
app.post('/__eval/trials', async (c) => {
  const input = v.safeParse(TrialInput, await c.req.json());
  if (!input.success) return c.json({ error: 'Unknown fixture or fault mode.' }, 400);
  const id = allocateTrial(input.output.fixture, input.output.fault);
  return c.json({ id, snapshot: trackerFor(id).snapshot() }, 201);
});
app.get('/__eval/trials/:id', (c) => c.json(trackerFor(c.req.param('id')).snapshot()));
app.delete('/__eval/trials/:id', (c) => {
  closeTrial(c.req.param('id'));
  return c.json({ closed: true });
});
// Keep the original mount URL so SDK admission stream URLs retain the prefix.
app.use('/agents/triage/*', async (c, next) => {
  const relativePath = c.req.path.slice('/agents/triage'.length);
  const id = relativePath.split('/')[1];
  trackerFor(id);
  const sending = c.req.method === 'POST' && relativePath === `/${id}`;
  if (sending && !process.env.OPENROUTER_API_KEY?.trim())
    return c.json({ error: 'Missing OPENROUTER_API_KEY. Offline lessons: npm run examples.' }, 503);
  if (sending) {
    const body = v.parse(v.record(v.string(), v.unknown()), await c.req.raw.json());
    c.req.raw = new Request(c.req.url, {
      method: 'POST',
      headers: c.req.raw.headers,
      body: JSON.stringify({ ...body, initialData: { trialId: id } }),
    });
  }
  await next();
});
app.route('/agents/triage', createAgentRouter(Triage));
app.onError((error, c) => c.json({ error: error.message }, 400));
export default app;
