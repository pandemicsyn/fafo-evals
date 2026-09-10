import * as v from 'valibot';
import { errorMessage } from '../src/json.ts';
import { courseProvider } from '../src/provider.ts';
try {
  const response = await fetch('https://openrouter.ai/api/v1/models?supported_parameters=tools', {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`OpenRouter catalog returned ${response.status}`);
  const data = v.parse(
    v.object({
      data: v.array(
        v.object({
          id: v.string(),
          pricing: v.object({ prompt: v.string(), completion: v.string() }),
          supported_parameters: v.array(v.string()),
        }),
      ),
    }),
    await response.json(),
  );
  const supported = new Set(
    courseProvider()
      .getModels()
      .map((m) => m.id),
  );
  console.table(
    data.data
      .filter(
        (m) =>
          m.id.endsWith(':free') &&
          Number(m.pricing.prompt) === 0 &&
          Number(m.pricing.completion) === 0,
      )
      .map((m) => ({
        model: m.id,
        triageCatalog: supported.has(m.id),
        jsonMode: m.supported_parameters.includes('response_format'),
      })),
  );
  console.log(
    'Current free tool-capable models. For this pinned app choose triageCatalog=true; the judge also needs JSON output. Set TRIAGE_MODEL and JUDGE_MODEL in .dev.vars, then restart npm run dev. Rate limits and availability still apply.',
  );
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
