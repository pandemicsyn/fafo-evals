import { setProvider } from '@flue/runtime';
import type { Model } from '@earendil-works/pi-ai';
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter';

// Pi 0.83's static catalog predates Flash. Extend its catalog using OpenRouter's
// public model metadata; keep Pi's authentication and streaming implementation.
// Source: https://openrouter.ai/api/v1/model/z-ai/glm-5.3-flash (2026-09-09).
// Rates are a catalog estimate, not measured billing; routing/provider rates vary.
export const flash: Model<'openai-completions'> = {
  id: 'z-ai/glm-5.3-flash',
  name: 'GLM 5.3 Flash',
  api: 'openai-completions',
  provider: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  reasoning: true,
  input: ['text', 'image'],
  contextWindow: 1048576,
  maxTokens: 131072,
  cost: { input: 0.07, output: 0.2333, cacheRead: 0.014, cacheWrite: 0 },
  compat: { supportsDeveloperRole: false, thinkingFormat: 'openrouter' },
};
export function courseProvider() {
  const provider = openrouterProvider();
  return {
    ...provider,
    getModels: () => [...provider.getModels().filter((m) => m.id !== flash.id), flash],
    streamSimple: ((model, context, options) =>
      provider.streamSimple(model, context, {
        ...options,
        maxTokens: Math.min(options?.maxTokens ?? 4096, 4096),
      })) as typeof provider.streamSimple,
  };
}
export function registerCourseProvider() {
  setProvider(courseProvider());
}
