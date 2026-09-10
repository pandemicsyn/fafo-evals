import { it, expect } from 'vitest';
import { modelId, localBaseUrl } from '../src/config.ts';
import { courseProvider } from '../src/provider.ts';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
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
it('loads an article server override from .dev.vars without the normal eval wrapper', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fafo-article-config-'));
  try {
    await writeFile(join(root, '.dev.vars'), 'FLUE_URL=http://127.0.0.1:4567\n');
    const configUrl = new URL('../vitest.article.config.ts', import.meta.url).href;
    const { FLUE_URL: _, ...env } = process.env;
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        '--import',
        import.meta.resolve('tsx'),
        '--input-type=module',
        '-e',
        `await import(${JSON.stringify(configUrl)}); console.log(process.env.FLUE_URL);`,
      ],
      { cwd: root, env, timeout: 10_000 },
    );
    expect(stdout.trim()).toBe('http://127.0.0.1:4567');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
