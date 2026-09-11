import { setProvider } from '@flue/runtime';
import type { Model } from '@earendil-works/pi-ai';
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter';

// Pi 0.83's static catalog predates Flash. Extend its catalog using OpenRouter's
// public model metadata; keep Pi's authentication and streaming implementation.
// Source: https://openrouter.ai/api/v1/models (2026-09-10), deepseek/deepseek-v4.1-flash.
// Rates are a catalog estimate, not measured billing; routing/provider rates vary.
export const flash: Model<'openai-completions'> = {
  id: 'deepseek/deepseek-v4.1-flash',
  name: 'DeepSeek V4.1 Flash',
  api: 'openai-completions',
  provider: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  reasoning: true,
  input: ['text', 'image'],
  contextWindow: 1048576,
  maxTokens: 384000,
  cost: { input: 0.3, output: 1.2, cacheRead: 0.006, cacheWrite: 0 },
  compat: { supportsDeveloperRole: false, thinkingFormat: 'openrouter' },
};
export function courseProvider() {
  const provider = openrouterProvider();
  return {
    ...provider,
    getModels: () => [...provider.getModels().filter((m) => m.id !== flash.id), flash],
    streamSimple: (model, context, options) =>
      provider.streamSimple(model, context, {
        ...options,
        maxTokens: Math.min(options?.maxTokens ?? 4096, 4096),
      }),
  } satisfies typeof provider;
}
export function registerCourseProvider() {
  setProvider(courseProvider());
}
