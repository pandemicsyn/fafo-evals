import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';

const server = createServer((_request, response) => {
  response.setHeader('content-type', 'application/json');
  response.end(
    JSON.stringify({
      ready: true,
      model: 'scripted/test',
      policyVersion: 'test',
      credentialsConfigured: true,
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

// Run the real CLI against a local health endpoint and a tiny stand-in test process.
// No model calls or module mocks: only the child exit and report availability vary.
it.each([
  { report: true, childCode: 0, expectedCode: 0 },
  { report: false, childCode: 0, expectedCode: 1 },
  { report: true, childCode: 2, expectedCode: 2 },
  { report: false, childCode: 2, expectedCode: 2 },
])(
  'retains exit status and evidence for $report / $childCode',
  async ({ report, childCode, expectedCode }) => {
    const root = await mkdtemp(join(tmpdir(), 'fafo-cli-'));
    try {
      await mkdir(join(root, 'node_modules/vitest'), { recursive: true });
      await writeFile(
        join(root, 'node_modules/vitest/vitest.mjs'),
        `
      import { writeFileSync } from 'node:fs';
      if (${report}) writeFileSync('artifacts/vitest-results.json', '{"testResults":[]}');
      process.exitCode = ${childCode};
    `,
      );
      const child = spawn(
        process.execPath,
        [
          '--import',
          import.meta.resolve('tsx'),
          fileURLToPath(new URL('../scripts/run-evals.ts', import.meta.url)),
          '--cases=new-search',
        ],
        {
          cwd: root,
          env: { ...process.env, FLUE_URL: base },
          stdio: ['ignore', 'ignore', 'pipe'],
        },
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
      expect(code, stderr).toBe(expectedCode);
      const runs = await readdir(join(root, 'artifacts/runs'));
      expect(runs).toHaveLength(1);
      const archived = join(root, 'artifacts/runs', runs[0], 'vitest-results.json');
      if (report) expect(await readFile(archived, 'utf8')).toBe('{"testResults":[]}');
      else {
        await expect(readFile(archived)).rejects.toMatchObject({ code: 'ENOENT' });
        expect(stderr).toContain('could not archive its Vitest report');
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
