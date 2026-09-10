import { existsSync } from 'node:fs';
export const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';
export function loadEnv() {
  if (existsSync('.dev.vars')) process.loadEnvFile('.dev.vars');
}
export function requireKey() {
  if (!process.env.OPENROUTER_API_KEY?.trim())
    throw new Error(
      'Live runs need OPENROUTER_API_KEY in .dev.vars. Start with npm run examples for the offline course.',
    );
}
export function modelId(value: string | undefined) {
  const id = value?.trim() || DEFAULT_MODEL;
  if (id.startsWith('openrouter/') || !/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._:/-]+$/.test(id)) {
    throw new Error(
      'Use a raw OpenRouter model ID such as z-ai/glm-5.3-flash, without the openrouter/ prefix.',
    );
  }
  return id;
}
export function localBaseUrl(value = process.env.FLUE_URL ?? 'http://127.0.0.1:3583') {
  const url = new URL(value);
  if (
    url.protocol !== 'http:' ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error(
      'FLUE_URL must be a loopback HTTP origin. This teaching app has local test-control routes.',
    );
  }
  return url.origin;
}
