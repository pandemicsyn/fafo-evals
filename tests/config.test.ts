import { it, expect } from 'vitest';
import { modelId, localBaseUrl } from '../src/config.ts';
import { courseProvider } from '../src/provider.ts';
it('resolves Flash and preserves other OpenRouter choices', () => {
  const catalog = courseProvider().getModels();
  expect(catalog.some((m) => m.id === modelId(undefined))).toBe(true);
  expect(catalog.some((m) => m.id === 'z-ai/glm-5.2')).toBe(true);
  expect(() => modelId('openrouter/z-ai/glm-5.3-flash')).toThrow();
});
it('rejects remote test-control URLs', () => {
  expect(() => localBaseUrl('https://example.com')).toThrow();
  expect(localBaseUrl('http://127.0.0.1:3583')).toBe('http://127.0.0.1:3583');
});
