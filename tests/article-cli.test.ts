import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';

let status = 200;
let credentialsConfigured = true;
const server = createServer((request, response) => {
  response.statusCode = request.url === '/health' ? status : 404;
  response.setHeader('content-type', 'application/json');
  response.end(
    JSON.stringify({
      ready: true,
      model: 'scripted/test',
      policyVersion: 'test',
      credentialsConfigured,
    }),
  );
});
let base: string;
beforeAll(async () => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected a TCP listener.');
  base = `http://127.0.0.1:${address.port}`;
});
afterAll(
  () =>
    new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    }),
);

// Exercise the real wrapper with a local health endpoint and a stand-in Vitest child.
// A failed preflight must leave existing evidence alone and never launch that child.
it.each([
  {
    scenario: 'unavailable',
    status: 200,
    credentials: true,
    childCode: 0,
    message: 'Start it with npm run dev in another terminal.',
  },
  {
    scenario: 'unhealthy',
    status: 503,
    credentials: true,
    childCode: 0,
    message: 'Server health check returned HTTP 503.',
  },
  {
    scenario: 'no credentials',
    status: 200,
    credentials: false,
    childCode: 0,
    message: 'The app needs OPENROUTER_API_KEY in .dev.vars.',
  },
  { scenario: 'passing trial', status: 200, credentials: true, childCode: 0, message: '' },
  { scenario: 'failing trial', status: 200, credentials: true, childCode: 2, message: '' },
])('handles $scenario before running the article example', async (example) => {
  status = example.status;
  credentialsConfigured = example.credentials;
  const root = await mkdtemp(join(tmpdir(), 'fafo-article-cli-'));
  try {
    await mkdir(join(root, 'node_modules/vitest'), { recursive: true });
    await mkdir(join(root, 'artifacts'));
    await writeFile(join(root, 'artifacts/article-results.json'), 'previous report');
    await writeFile(
      join(root, '.dev.vars'),
      `FLUE_URL=${example.scenario === 'unavailable' ? 'http://127.0.0.1:0' : base}\n`,
    );
    await writeFile(
      join(root, 'node_modules/vitest/vitest.mjs'),
      `import { writeFileSync } from 'node:fs';
      writeFileSync('child-args.json', JSON.stringify(process.argv.slice(2)));
      writeFileSync('artifacts/article-results.json', 'new report');
      process.exitCode = ${example.childCode};`,
    );
    const { FLUE_URL: _, ...env } = process.env;
    const child = spawn(
      process.execPath,
      [
        '--import',
        import.meta.resolve('tsx'),
        fileURLToPath(new URL('../scripts/run-article.ts', import.meta.url)),
        '--testNamePattern=complete report',
      ],
      { cwd: root, env, stdio: ['ignore', 'ignore', 'pipe'] },
    );
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    const code = await new Promise<number | null>((resolve, reject) => {
      child.once('error', reject);
      child.once('close', resolve);
    });
    expect(code, stderr).toBe(example.message ? 1 : example.childCode);
    if (example.message) {
      expect(stderr.trim().split('\n')).toHaveLength(1);
      expect(stderr).toContain(example.message);
      expect(await readFile(join(root, 'artifacts/article-results.json'), 'utf8')).toBe(
        'previous report',
      );
      await expect(readFile(join(root, 'child-args.json'))).rejects.toMatchObject({
        code: 'ENOENT',
      });
    } else {
      expect(stderr).toBe('');
      expect(await readFile(join(root, 'child-args.json'), 'utf8')).toBe(
        JSON.stringify([
          'run',
          '--config',
          'vitest.article.config.ts',
          '--testNamePattern=complete report',
        ]),
      );
      expect(await readFile(join(root, 'artifacts/article-results.json'), 'utf8')).toBe(
        'new report',
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
