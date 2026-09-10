import * as v from 'valibot';
import { parseJson } from '../src/json.ts';
import { it, expect, vi, afterEach } from 'vitest';
import { assessPair, openRouterJudgeHarness, parseVerdict } from '../src/evals/judge.ts';
afterEach(() => vi.unstubAllEnvs());
const pair = { report: 'Empty export spins forever.', issue: 'Export spins forever.' };
it('requires real evidence and a binary schema', () => {
  expect(() =>
    parseVerdict(
      { verdict: 'pass', reason: 'fine', evidence: [{ source: 'issue', quote: 'made up' }] },
      pair,
    ),
  ).toThrow('absent');
  expect(() =>
    parseVerdict(
      { verdict: 'maybe', reason: 'fine', evidence: [{ source: 'issue', quote: 'Export' }] },
      pair,
    ),
  ).toThrow();
});
it('does not convert rate limits, malformed JSON or missing content into a pass', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-no-network');
  for (const response of [
    new Response('', { status: 429 }),
    Response.json({ choices: [{ message: { content: 'not JSON' } }] }),
    Response.json({ choices: [] }),
  ]) {
    const fakeFetch = vi.fn<typeof fetch>().mockResolvedValue(response);
    await expect(assessPair(pair, openRouterJudgeHarness({ fetch: fakeFetch }))).rejects.toThrow();
  }
});
it('passes only the report and issue to a separately configured judge', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-no-network');
  vi.stubEnv('JUDGE_MODEL', 'z-ai/glm-5.3-flash');
  const fakeFetch = vi.fn<typeof fetch>().mockResolvedValue(
    Response.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              verdict: 'fail',
              reason: 'Missing empty condition',
              evidence: [{ source: 'report', quote: 'Empty' }],
            }),
          },
        },
      ],
    }),
  );
  expect((await assessPair(pair, openRouterJudgeHarness({ fetch: fakeFetch }))).verdict).toBe(
    'fail',
  );
  const requestBody = fakeFetch.mock.calls[0][1]?.body;
  if (typeof requestBody !== 'string') throw new Error('Expected a JSON request body.');
  const body = v.parse(
    v.object({ model: v.string(), messages: v.array(v.object({ content: v.string() })) }),
    parseJson(requestBody),
  );
  expect(parseJson(body.messages[1].content)).toEqual(pair);
  expect(body.model).toBe('z-ai/glm-5.3-flash');
});
